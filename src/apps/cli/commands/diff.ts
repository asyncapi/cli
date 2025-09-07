/* eslint-disable sonarjs/no-duplicate-string */
import { Args } from '@oclif/core';
import * as diff from '@asyncapi/diff';
import AsyncAPIDiff from '@asyncapi/diff/lib/asyncapidiff';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import { load, Specification } from '@models/SpecificationFile';
import Command from '@cli/internal/base';
import { ValidationError } from '@errors/validation-error';
import { SpecificationFileNotFound } from '@errors/specification-file';
import {
  DiffBreakingChangeError,
  DiffOverrideFileError,
  DiffOverrideJSONError,
} from '@errors/diff-error';
import { specWatcher } from '@cli/internal/globals';

import type { SpecWatcherParams } from '@cli/internal/globals';
import { diffFlags } from '@cli/internal/flags/diff.flags';
import {
  ValidationService,
  ValidationStatus,
} from '@/domains/services/validation.service';
import { Diagnostic } from '@asyncapi/parser/cjs';

const { readFile } = fs;

export default class Diff extends Command {
  static description = 'Find diff between two asyncapi files';
  private validationService = new ValidationService({});
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
  async run() {
    const { args, flags } = await this.parse(Diff); // NOSONAR
    const firstDocumentPath = args['old'];
    const secondDocumentPath = args['new'];

    const outputFormat = flags['format'];
    const outputType = flags['type'];
    const overrideFilePath = flags['overrides'];
    let markdownSubtype = flags['markdownSubtype'];
    const watchMode = flags['watch'];
    const noError = flags['no-error'];
    let firstDocument: Specification, secondDocument: Specification;

    checkAndWarnFalseFlag(outputFormat, markdownSubtype);
    markdownSubtype = setDefaultMarkdownSubtype(
      outputFormat,
      markdownSubtype,
    ) as string;

    this.metricsMetadata.output_format = outputFormat;
    this.metricsMetadata.output_type = outputType;
    if (outputFormat === 'md') {
      this.metricsMetadata.output_markdown_subtype = flags['markdownSubtype'];
    }

    try {
      firstDocument = await load(firstDocumentPath);

      enableWatch(watchMode, {
        spec: firstDocument,
        handler: this,
        handlerName: 'diff',
        docVersion: 'old',
        label: 'DIFF_OLD',
      });
    } catch (err) {
      if (err instanceof SpecificationFileNotFound) {
        this.error(
          new ValidationError({
            type: 'invalid-file',
            filepath: firstDocumentPath,
          }),
        );
      }
      this.error(err as Error);
    }

    try {
      secondDocument = await load(secondDocumentPath);

      enableWatch(watchMode, {
        spec: secondDocument,
        handler: this,
        handlerName: 'diff',
        docVersion: 'new',
        label: 'DIFF_NEW',
      });
    } catch (err) {
      if (err instanceof SpecificationFileNotFound) {
        this.error(
          new ValidationError({
            type: 'invalid-file',
            filepath: secondDocumentPath,
          }),
        );
      }
      this.error(err as Error);
    }

    let overrides: Awaited<ReturnType<typeof readOverrideFile>> = {};
    if (overrideFilePath) {
      try {
        overrides = await readOverrideFile(overrideFilePath);
      } catch (err) {
        this.error(err as Error);
      }
    }

    try {
      const parsed = await this.parseDocuments(
        this,
        firstDocument,
        secondDocument,
        flags,
      );
      if (!parsed) {
        return;
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

      if (outputFormat === 'json') {
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
      if (!noError) {
        throwOnBreakingChange(diffOutput, outputFormat);
      }
    } catch (error) {
      if (
        error instanceof DiffBreakingChangeError ||
        error instanceof TypeError
      ) {
        this.error(error);
      }
      throw new ValidationError({
        type: 'parser-error',
        err: error,
      });
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
      this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: firstDocument.getFilePath() || secondDocument.getFilePath(),
          err: firstResult.error || secondResult.error,
        }),
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
  } catch (err) {
    throw new DiffOverrideFileError();
  }

  try {
    return JSON.parse(overrideStringData);
  } catch (err) {
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
 * Throws `DiffBreakingChangeError` when breaking changes are detected
 */
function throwOnBreakingChange(diffOutput: AsyncAPIDiff, outputFormat: string) {
  const breakingChanges = diffOutput.breaking();
  if (
    (outputFormat === 'json' && breakingChanges.length !== 0) ||
    ((outputFormat === 'yaml' || outputFormat === 'yml') &&
      breakingChanges !== '[]\n')
  ) {
    throw new DiffBreakingChangeError();
  }
}

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
    console.log(warningMessage);
  }
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
