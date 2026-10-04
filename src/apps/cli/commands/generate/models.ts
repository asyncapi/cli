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
import path from 'node:path';
import { describeSource, listFiles } from '@cli/internal/output/source';

export default class Models extends Command {
  static readonly description = 'Generates typed models';
  private validationService = new ValidationService();
  static readonly args = ModelinaArgs as any;

  static readonly flags = {
    ...modelsFlags(),
    ...proxyFlags(),
  };
   
  async run(): Promise<unknown> {
    const { args, flags } = await this.parse(Models);
    const json = this.jsonEnabled();
    const { language, file, output } = await this.resolveInputs(args, flags, json);

    const inputFile = await this.loadInput(file, flags, json);
    this.specFile = inputFile;
    const { document, diagnostics, status } = await this.parseValidDocument(inputFile, flags);

    if (flags['log-diagnostics'] && !json) {
      this.handleGovernanceMessage(inputFile, diagnostics, status as ValidationStatus);
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
    const s = json ? { start: () => undefined, stop: () => undefined } : spinner();
    s.start('Generating models...');
    let generatedModels;
    try {
      generatedModels = await generateModels(
        { ...flags, output },
        document,
        this.createModelinaLogger(json, logs, warnings),
        language as Languages,
      );
    } catch (error) {
      s.stop(green('Failed to generate models'));
      throw new ApplicationError(
        CLI_ERROR_CODES.MODEL_GENERATION_FAILED,
        getErrorMessage(error, 'An unknown error occurred during model generation.'),
        { cause: error },
      );
    }

    const toFiles = Boolean(output && output !== 'stdout');
    const summary = toFiles
      ? generatedModels.map((model) => model.modelName).join(', ')
      : generatedModels
        .map((model) => `\n  ## Model name: ${model.modelName}\n  ${model.result}\n        `)
        .join('\n');
    s.stop(green(`Successfully generated the following models: ${summary}`));

    return this.result('Models generated successfully.', {
      source: describeSource(file, inputFile),
      language,
      outputDirectory: toFiles ? path.resolve(output) : null,
      generatedFiles: toFiles ? await listFiles(output) : [],
      models: generatedModels.map((model) => ({
        name: model.modelName,
        content: toFiles ? null : model.result,
        path: null,
      })),
      logs,
      diagnostics: diagnostics.map(normalizeDiagnostic),
      warnings: warnings.map((message) => ({ code: 'MODEL_GENERATION_WARNING', message })),
    });
  }

  private async resolveInputs(args: Record<string, any>, flags: Record<string, any>, json: boolean) {
    let { language, file } = args;
    let { output } = flags;

    if (flags['no-interactive'] && !json) {
      intro(inverse('AsyncAPI Generate Models'));
      ({ language, file, output } = await this.parseArgs(args, output));
    }

    if (json && (!language || !file)) {
      const missing = [language ? '' : 'language', file ? '' : 'AsyncAPI document'].filter(Boolean);
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
    return { language: language as string, file: file as string, output: output as string };
  }

  private async loadInput(file: string, flags: Record<string, any>, json: boolean): Promise<Specification> {
    const fileWithProxy = applyProxyToPath(file, flags.proxyHost, flags.proxyPort);
    try {
      return (await load(fileWithProxy)) || (await load());
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
  }

  private async parseValidDocument(inputFile: Specification, flags: Record<string, any>) {
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
    }
    if (!result.data) {
      throw new ApplicationError(
        CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED,
        'No data returned from parsing the AsyncAPI document.',
      );
    }

    const { document, diagnostics, status } = result.data;
    if (!document || status === 'invalid') {
      const severityErrors = diagnostics.filter((obj) => obj.severity === 0);
      const message = 'Input is not a correct AsyncAPI document so it cannot be processed.';
      throw new ApplicationError(
        CLI_ERROR_CODES.ASYNCAPI_DOCUMENT_INVALID,
        this.jsonEnabled()
          ? message
          : `${message}${this.validationService.formatDiagnosticsOutput(severityErrors, 'stylish', 'error')}`,
        { details: { diagnostics: severityErrors.map(normalizeDiagnostic) } },
      );
    }
    return { document, diagnostics, status };
  }

  private createModelinaLogger(json: boolean, logs: string[], warnings: string[]) {
    return {
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
