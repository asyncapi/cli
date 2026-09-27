import Command from '@cli/internal/base';
import { load, Specification } from '@models/SpecificationFile';
import { cancel, intro, isCancel, select, spinner, text } from '@clack/prompts';
import { green, inverse } from 'picocolors';
import {
  generateModels,
  Languages,
  ModelinaArgs,
} from '@asyncapi/modelina-cli';
import { modelsFlags } from '@cli/internal/flags/generate/models.flags';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { ValidationOptions } from '@/interfaces';
import {
  ValidationService,
  ValidationStatus,
} from '@/domains/services/validation.service';
import { Diagnostic, DiagnosticSeverity } from '@asyncapi/parser/cjs';
import { applyProxyToPath } from '@utils/proxy';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';
import { getErrorMessage } from '@utils/error-handler';
import path from 'path';
import { promises as fs } from 'fs';

export default class Models extends Command {
  static description = 'Generates typed models';
  private validationService = new ValidationService();
  static readonly args = ModelinaArgs as any;

  static readonly flags = {
    ...modelsFlags(),
    ...proxyFlags(),
  };
   
  async run(): Promise<unknown> {
    const { args, flags } = await this.parse(Models);
    let { language, file } = args;
    let { output } = flags;
    const { proxyPort, proxyHost } = flags;

    const json = this.jsonEnabled();
    const interactive = !flags['no-interactive'] && !json;

    if (!interactive && !json) {
      intro(inverse('AsyncAPI Generate Models'));

      const parsedArgs = await this.parseArgs(args, output);
      language = parsedArgs.language;
      file = parsedArgs.file;
      output = parsedArgs.output;
    }

    if (json && (!language || !file)) {
      const missing = [!language ? 'language' : '', !file ? 'AsyncAPI document' : ''].filter(Boolean);
      throw new ApplicationError(
        CLI_ERROR_CODES.CLI_ARGUMENT_REQUIRED,
        `Missing required generation input: ${missing.join(', ')}.`,
      );
    }
    if (!Object.values(Languages).includes(language as Languages)) {
      throw new ApplicationError(
        CLI_ERROR_CODES.GENERATION_LANGUAGE_UNSUPPORTED,
        `Unsupported model generation language: ${language}.`,
      );
    }
    const fileWithProxy = applyProxyToPath(file, proxyHost, proxyPort);
    let inputFile: Specification;
    try {
      inputFile = (await load(fileWithProxy)) || (await load());
    } catch (error) {
      if (!json) {
        throw error;
      }
      throw new ApplicationError(
        CLI_ERROR_CODES.SPEC_FILE_NOT_FOUND,
        getErrorMessage(error, `Unable to load AsyncAPI document: ${file}.`),
        { cause: error },
      );
    }
    this.specFile = inputFile;

    const result = await this.validationService.parseDocument(
      inputFile,
      {},
      flags as ValidationOptions,
    );
    if (!result.success) {
      throw new ApplicationError(
        CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED,
        `Failed to parse the AsyncAPI document: ${result.error}`,
        { details: result.diagnostics },
      );
    } else if (!result.data) {
      throw new ApplicationError(
        CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED,
        'No data returned from parsing the AsyncAPI document.',
      );
    }

    const { document, diagnostics, status } = result.data;
    const structuredDiagnostics = diagnostics.map(normalizeDiagnostic);

    if (!document || status === 'invalid') {
      const severityErrors = diagnostics.filter((obj) => obj.severity === 0);
      if (json) {
        throw new ApplicationError(
          CLI_ERROR_CODES.ASYNCAPI_DOCUMENT_INVALID,
          'Input is not a correct AsyncAPI document so it cannot be processed.',
          { details: { diagnostics: severityErrors.map(normalizeDiagnostic) } },
        );
      }
      this.log(
        `Input is not a correct AsyncAPI document so it cannot be processed.${this.validationService.formatDiagnosticsOutput(severityErrors, 'stylish', 'error')}`,
      );
      return;
    }
    if (flags['log-diagnostics'] && inputFile && !json) {
      this.handleGovernanceMessage(
        inputFile,
        diagnostics,
        status as ValidationStatus,
      );
      this.log(
        this.validationService.formatDiagnosticsOutput(
          diagnostics,
          flags['diagnostics-format'],
          flags['fail-severity'],
        ),
      );
    }

    const logs: string[] = [];
    const warnings: string[] = [];
    const logger = {
      info: (message: string) => {
        logs.push(message);
        if (!json) {
          this.log(message);
        }
      },
      debug: (message: string) => {
        logs.push(message);
        if (!json) {
          this.debug(message);
        }
      },
      warn: (message: string) => {
        warnings.push(message);
        if (!json) {
          this.warn(message);
        }
      },
      error: (message: string) => {
        if (json) {
          logs.push(message);
        } else {
          this.error(message);
        }
      },
    };

    const s = json ? { start: () => undefined, stop: () => undefined } : spinner();
    s.start('Generating models...');
    try {
      const generatedModels = await generateModels(
        { ...flags, output },
        document,
        logger,
        language as Languages,
      );
      if (output && output !== 'stdout') {
        const generatedModelStrings = generatedModels.map((model) => {
          return model.modelName;
        });
        s.stop(
          green(
            `Successfully generated the following models: ${generatedModelStrings.join(', ')}`,
          ),
        );
        return this.result('Models generated successfully.', {
          source: this.sourceDescriptor(file, inputFile),
          language,
          outputDirectory: path.resolve(output),
          generatedFiles: await this.generatedFiles(output),
          models: generatedModels.map((model) => ({ name: model.modelName, content: null, path: null })),
          logs,
          diagnostics: structuredDiagnostics,
          warnings: warnings.map((message) => ({ code: 'MODEL_GENERATION_WARNING', message })),
        });
      }
      const generatedModelStrings = generatedModels.map((model) => {
        return `
  ## Model name: ${model.modelName}
  ${model.result}
        `;
      });
      s.stop(
        green(
          `Successfully generated the following models: ${generatedModelStrings.join('\n')}`,
        ),
      );
      return this.result('Models generated successfully.', {
        source: this.sourceDescriptor(file, inputFile),
        language,
        outputDirectory: null,
        generatedFiles: [],
        models: generatedModels.map((model) => ({ name: model.modelName, content: model.result, path: null })),
        logs,
        diagnostics: structuredDiagnostics,
        warnings: warnings.map((message) => ({ code: 'MODEL_GENERATION_WARNING', message })),
      });
    } catch (error) {
      s.stop(green('Failed to generate models'));
      throw new ApplicationError(
        CLI_ERROR_CODES.MODEL_GENERATION_FAILED,
        getErrorMessage(error, 'An unknown error occurred during model generation.'),
        { cause: error },
      );
    }
  }

  private async parseArgs(args: Record<string, any>, output?: string) {
    let { language, file } = args;
    let askForOutput = false;
    const operationCancelled = 'Operation cancelled by the user.';
    if (!language) {
      language = await select({
        message: 'Select the language you want to generate models for',
        options: Object.keys(Languages).map((key) => ({
          value: key,
          label: key,
          hint: Languages[key as keyof typeof Languages],
        })),
      });

      askForOutput = true;
    }

    if (isCancel(language)) {
      cancel(operationCancelled);
      this.exit();
    }

    if (!file) {
      file = await text({
        message: 'Enter the path or URL to the AsyncAPI document',
        defaultValue: 'asyncapi.yaml',
        placeholder: 'asyncapi.yaml',
      });

      askForOutput = true;
    }

    if (isCancel(file)) {
      cancel(operationCancelled);
      this.exit();
    }

    if (!output && askForOutput) {
      output = (await text({
        message: 'Enter the output directory or stdout to write the models to',
        defaultValue: 'stdout',
        placeholder: 'stdout',
      })) as string;
    }

    if (isCancel(output)) {
      cancel(operationCancelled);
      this.exit();
    }

    return { language, file, output: output ?? 'stdout' };
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

  private sourceDescriptor(input: string, specification: Specification) {
    const url = specification.getFileURL();
    return {
      input: this.redactUrl(input),
      kind: url ? 'url' : 'file',
      resolved: url ? this.redactUrl(url) : path.resolve(specification.getFilePath() ?? input),
    };
  }

  private async generatedFiles(output: string): Promise<string[]> {
    const root = path.resolve(output);
    const files: string[] = [];
    const visit = async (directory: string): Promise<void> => {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      await Promise.all(entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          await visit(entryPath);
        } else if (entry.isFile()) {
          files.push(entryPath);
        }
      }));
    };
    await visit(root);
    return files.sort();
  }

  private redactUrl(value: string): string {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return value;
      }
      url.username = '';
      url.password = '';
      for (const key of [...url.searchParams.keys()]) {
        if ((/token|key|secret|password|auth/i).test(key)) {
          url.searchParams.set(key, '[REDACTED]');
        }
      }
      return url.toString();
    } catch {
      return value;
    }
  }
}

function normalizeDiagnostic(diagnostic: Diagnostic) {
  const severities = {
    [DiagnosticSeverity.Error]: 'error',
    [DiagnosticSeverity.Warning]: 'warning',
    [DiagnosticSeverity.Information]: 'info',
    [DiagnosticSeverity.Hint]: 'hint',
  } as const;
  return {
    code: String(diagnostic.code ?? ''),
    message: diagnostic.message,
    severity: severities[diagnostic.severity],
    path: diagnostic.path ?? [],
    range: diagnostic.range ?? null,
  };
}
