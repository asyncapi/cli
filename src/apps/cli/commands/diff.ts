 
import { Args } from '@oclif/core';
import * as diff from '@asyncapi/diff';
import AsyncAPIDiff from '@asyncapi/diff/lib/asyncapidiff';
import { existsSync, promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { load, Specification } from '@models/SpecificationFile';
import Command from '@cli/internal/base';
import { ValidationError } from '@errors/validation-error';
import {
  DiffBreakingChangeError,
  DiffOverrideFileError,
  DiffOverrideJSONError,
} from '@errors/diff-error';
import {
  emitWatchStarted,
  isWatchRerun,
  specWatcher,
} from '@cli/internal/globals';

import type { SpecWatcherParams } from '@cli/internal/globals';
import { diffFlags } from '@cli/internal/flags/diff.flags';
import {
  ValidationService,
  ValidationStatus,
} from '@/domains/services/validation.service';
import { Diagnostic } from '@asyncapi/parser/cjs';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

const { readFile } = fs;

export default class Diff extends Command {
  static description = 'Find diff between two asyncapi files';
  private validationService = new ValidationService();
  static flags = diffFlags();

  static args = {
    old: Args.string({
      description: 'old spec path, URL or context-name',
      required: true,
    }),
    new: Args.string({
      description: 'new spec path, URL or context-name',
      required: true,
    }),
  };

  /* eslint-disable sonarjs/cognitive-complexity */
  async run(): Promise<unknown> {
    const { args, flags } = await this.parse(Diff); // NOSONAR
    const firstDocumentPath = args['old'];
    const secondDocumentPath = args['new'];

    const outputFormat = flags['format'];
    const outputType = flags['type'];
    const overrideFilePath = flags['overrides'];
    let markdownSubtype = flags['markdownSubtype'];
    const watchMode = flags['watch'];
    const watchRerun = isWatchRerun(this);
    const noError = flags['no-error'];
    const writeOutput = flags['save-output'];
    const outputOverwritten = writeOutput ? existsSync(path.resolve(writeOutput)) : false;
    const flagWarning = checkAndWarnFalseFlag(outputFormat, markdownSubtype);
    if (flagWarning) {
      this.log(flagWarning);
    }
    markdownSubtype = setDefaultMarkdownSubtype(
      outputFormat,
      markdownSubtype,
    ) as string;

    this.metricsMetadata.output_format = outputFormat;
    this.metricsMetadata.output_type = outputType;
    if (outputFormat === 'md') {
      this.metricsMetadata.output_markdown_subtype = flags['markdownSubtype'];
    }

    // load() throws typed errors that the central error mapper classifies.
    const firstDocument = await load(firstDocumentPath);
    enableWatch(watchMode && !watchRerun, {
      spec: firstDocument,
      handler: this,
      handlerName: 'diff',
      docVersion: 'old',
      label: 'DIFF_OLD',
    });

    const secondDocument = await load(secondDocumentPath);
    enableWatch(watchMode && !watchRerun, {
      spec: secondDocument,
      handler: this,
      handlerName: 'diff',
      docVersion: 'new',
      label: 'DIFF_NEW',
    });

    let overrides: Awaited<ReturnType<typeof readOverrideFile>> = {};
    if (overrideFilePath) {
      // DiffOverrideFileError / DiffOverrideJSONError are mapped centrally.
      overrides = await readOverrideFile(overrideFilePath);
    }

    try {
      const parsed = await this.parseDocuments(
        this,
        firstDocument,
        secondDocument,
        flags,
      );
      if (!parsed) {
        throw Object.assign(
          new ApplicationError(
            CLI_ERROR_CODES.ASYNCAPI_DOCUMENT_INVALID,
            'One or both AsyncAPI documents are invalid, so they cannot be compared.',
          ),
          { name: 'ValidationError' },
        );
      }

      const diffOutput = diff.diff(
        parsed.firstDocumentParsed.json(),
        parsed.secondDocumentParsed.json(),
        {
          override: overrides,
          outputType: outputFormat as diff.OutputType, // NOSONAR
          markdownSubtype: markdownSubtype as diff.MarkdownSubtype,
        },
      );
      const structuredDiffOutput = diff.diff(
        parsed.firstDocumentParsed.json(),
        parsed.secondDocumentParsed.json(),
        {
          override: overrides,
          outputType: 'json',
          markdownSubtype: markdownSubtype as diff.MarkdownSubtype,
        },
      );
      const breaking = structuredDiffOutput.breaking() as unknown[];
      const nonBreaking = structuredDiffOutput.nonBreaking() as unknown[];
      const unclassified = structuredDiffOutput.unclassified() as unknown[];

      if (writeOutput) {
        await this.writeOutputToFile(diffOutput,outputType,writeOutput,outputFormat);
      } else if (outputFormat === 'json') {
        this.outputJSON(diffOutput, outputType);
      } else if (outputFormat === 'yaml' || outputFormat === 'yml') {
        this.outputYAML(diffOutput, outputType);
      } else if (outputFormat === 'md') {
        this.outputMarkdown(diffOutput, outputType);
      } else {
        this.log(
          `The output format ${outputFormat} is not supported at the moment.`,
        );
      }

      const hasBreakingChanges = breaking.length > 0;
      if (hasBreakingChanges && !noError) {
        throw new DiffBreakingChangeError();
      }

      const warnings = [];
      if (flagWarning) {
        warnings.push({ code: 'INAPPLICABLE_FLAG', message: flagWarning });
      }
      if (hasBreakingChanges && noError) {
        warnings.push({
          code: 'BREAKING_CHANGES_DETECTED',
          message: 'Breaking changes were detected but --no-error was used.',
        });
      }
      const status = warnings.length > 0 ? 'warning' : 'success';
      const commandResult = this.result(
        hasBreakingChanges
          ? 'The diff completed and found breaking changes.'
          : 'The diff completed successfully.',
        {
          old: sourceData(firstDocumentPath, firstDocument),
          new: sourceData(secondDocumentPath, secondDocument),
          type: outputType,
          format: outputFormat === 'yml' ? 'yaml' : outputFormat,
          changes: writeOutput ? null : genericOutput(structuredDiffOutput, outputType),
          counts: {
            breaking: breaking.length,
            nonBreaking: nonBreaking.length,
            unclassified: unclassified.length,
          },
          output: writeOutput
            ? {
              path: path.resolve(writeOutput),
              format: outputFormat === 'yml' ? 'yaml' : outputFormat,
              overwritten: outputOverwritten,
            }
            : null,
          warnings,
        },
        status,
      );
      if (watchMode && this.jsonEnabled() && !watchRerun) {
        emitWatchStarted(
          this,
          commandResult,
          [firstDocument.getFilePath(), secondDocument.getFilePath()].filter(
            (filePath): filePath is string => Boolean(filePath),
          ),
        );
        return;
      }

      return commandResult;
    } catch (error) {
      if (
        error instanceof DiffBreakingChangeError ||
        error instanceof TypeError
      ) {
        throw error;
      }
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw new ApplicationError(
        CLI_ERROR_CODES.DEPENDENCY_ERROR,
        error instanceof Error ? error.message : 'The diff operation failed.',
        { cause: error },
      );
    }
  }

  outputJSON(diffOutput: AsyncAPIDiff, outputType: string) {
    if (outputType === 'breaking') {
      this.log(JSON.stringify(diffOutput.breaking(), null, 2));
    } else if (outputType === 'non-breaking') {
      this.log(JSON.stringify(diffOutput.nonBreaking(), null, 2));
    } else if (outputType === 'unclassified') {
      this.log(JSON.stringify(diffOutput.unclassified(), null, 2));
    } else if (outputType === 'all') {
      this.log(JSON.stringify(diffOutput.getOutput(), null, 2));
    } else {
      this.log(`The output type ${outputType} is not supported at the moment.`);
    }
  }

  async writeOutputToFile(diffOutput: AsyncAPIDiff, outputType: string, filePath: string, outputFormat: string) {
    let content: string;
    
    if (outputFormat === 'json') {
      if (outputType === 'breaking') {
        content = JSON.stringify(diffOutput.breaking(), null, 2);
      } else if (outputType === 'non-breaking') {
        content = JSON.stringify(diffOutput.nonBreaking(), null, 2);
      } else if (outputType === 'unclassified') {
        content = JSON.stringify(diffOutput.unclassified(), null, 2);
      } else if (outputType === 'all') {
        content = JSON.stringify(diffOutput.getOutput(), null, 2);
      } else {
        content = `The output type ${outputType} is not supported at the moment.`;
      }
    } else if (outputFormat === 'yaml' || outputFormat === 'yml') {
      content = genericOutput(diffOutput, outputType) as string;
    } else if (outputFormat === 'md') {
      content = genericOutput(diffOutput, outputType) as string;
    } else {
      content = `The output format ${outputFormat} is not supported at the moment.`;
    }
    
    await fs.writeFile(filePath, content);
    this.log(`Output successfully written to: ${filePath}`);
  }

  outputYAML(diffOutput: AsyncAPIDiff, outputType: string) {
    this.log(genericOutput(diffOutput, outputType) as string);
  }

  outputMarkdown(diffOutput: AsyncAPIDiff, outputType: string) {
    this.log(genericOutput(diffOutput, outputType) as string);
  }

  async parseDocuments(
    command: Command,
    firstDocument: Specification,
    secondDocument: Specification,
    flags: Record<string, any>,
  ) {
    const firstResult = await this.validationService.parseDocument(
      firstDocument,
      {},
      flags,
    );
    const secondResult = await this.validationService.parseDocument(
      secondDocument,
      {},
      flags,
    );

    if (!firstResult.success || !secondResult.success) {
      const validationError = new ValidationError({
        type: 'invalid-file',
        filepath: firstDocument.getFilePath() || secondDocument.getFilePath(),
        err: firstResult.error || secondResult.error,
      });
      // Preserve the historical `ValidationError:` prefix in human output.
      throw Object.assign(
        new ApplicationError(
          CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED,
          validationError.message,
          {
            cause: validationError,
            details: firstResult.error || secondResult.error,
          },
        ),
        { name: validationError.name },
      );
    }

    if (!firstResult.data || !secondResult.data) {
      return;
    }

    const {
      document: firstDocumentParsed,
      status: firstDocumentStatus,
      diagnostics: firstDiagnostics,
    } = firstResult.data;
    const {
      document: secondDocumentParsed,
      status: secondDocumentStatus,
      diagnostics: secondDiagnostics,
    } = secondResult.data;

    if (flags['log-diagnostics']) {
      this.log(
        `Diagnostics for ${firstDocument.getFilePath() || firstDocument.getFileURL()}:`,
      );
      this.handleGovernanceMessage(
        firstDocument,
        firstDiagnostics,
        firstDocumentStatus as ValidationStatus,
      );
      this.log(
        this.validationService.formatDiagnosticsOutput(
          firstDiagnostics,
          flags['diagnostics-format'],
          flags['fail-severity'],
        ),
      );
      this.log(
        `Diagnostics for ${secondDocument.getFilePath() || secondDocument.getFileURL()}:`,
      );
      this.handleGovernanceMessage(
        secondDocument,
        secondDiagnostics,
        secondDocumentStatus as ValidationStatus,
      );
      this.log(
        this.validationService.formatDiagnosticsOutput(
          secondDiagnostics,
          flags['diagnostics-format'],
          flags['fail-severity'],
        ),
      );
    }

    if (
      !firstDocumentParsed ||
      !secondDocumentParsed ||
      firstDocumentStatus === 'invalid' ||
      secondDocumentStatus === 'invalid'
    ) {
      return;
    }

    return { firstDocumentParsed, secondDocumentParsed };
  }

  async handleGovernanceMessage(
    document: Specification,
    diagnostics: Diagnostic[],
    status: ValidationStatus,
  ) {
    const sourceString = document.toSourceString();
    const hasIssues = diagnostics && diagnostics.length > 0;
    const isFailSeverity = status === ValidationStatus.INVALID;

    const governanceMessage = this.validationService.generateGovernanceMessage(
      sourceString,
      hasIssues,
      isFailSeverity,
    );

    if (isFailSeverity) {
      this.logToStderr(governanceMessage);
    } else {
      this.log(governanceMessage);
    }
  }
}

/**
 * A generic output function for diff output
 * @param diffOutput The diff output data
 * @param outputType The output format requested by the user
 * @returns The output(if the format exists) or a message indicating the format doesn't exist
 */
function genericOutput(diffOutput: AsyncAPIDiff, outputType: string) {
  switch (outputType) {
  case 'breaking':
    return diffOutput.breaking();
  case 'non-breaking':
    return diffOutput.nonBreaking();
  case 'unclassified':
    return diffOutput.unclassified();
  case 'all':
    return diffOutput.getOutput();
  default:
    return `The output type ${outputType} is not supported at the moment.`;
  }
}

/**
 * Reads the file from give path and parses it as JSON
 * @param path The path to override file
 * @returns The override object
 */
async function readOverrideFile(path: string): Promise<diff.OverrideObject> {
  let overrideStringData;
  try {
    overrideStringData = await readFile(path, { encoding: 'utf8' });
  } catch {
    throw new DiffOverrideFileError();
  }

  try {
    return JSON.parse(overrideStringData);
  } catch {
    throw new DiffOverrideJSONError();
  }
}

/**
 * function to enable watchmode.
 * The function is abstracted here, to avoid eslint cognitive complexity error.
 */
const enableWatch = (status: boolean, watcher: SpecWatcherParams) => {
  if (status) {
    specWatcher(watcher);
  }
};

/**
 * Checks and warns user about providing unnecessary markdownSubtype option.
 */
function checkAndWarnFalseFlag(
  format: string,
  markdownSubtype: string | undefined,
) {
  if (format !== 'md' && typeof markdownSubtype !== 'undefined') {
    const warningMessage = chalk.yellowBright(
      `Warning: The given markdownSubtype flag will not work with the given format.\nProvided flag markdownSubtype: ${markdownSubtype}`,
    );
    return warningMessage;
  }
}

function sourceData(input: string, specification: Specification) {
  const source = specification.getFileURL() ?? specification.getFilePath() ?? input;
  const resolved = specification.getFileURL() ?? path.resolve(source);
  let kind = 'context';
  if (specification.getFileURL()) {
    kind = 'url';
  } else if (path.resolve(input) === resolved) {
    kind = 'file';
  }
  return { input, kind, resolved };
}

/**
 * Sets the default markdownSubtype option in case user doesn't provide one.
 */
function setDefaultMarkdownSubtype(
  format: string,
  markdownSubtype: string | undefined,
) {
  if (format === 'md' && typeof markdownSubtype === 'undefined') {
    return 'yaml';
  }
  return markdownSubtype;
}
