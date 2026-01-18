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
import { Diagnostic } from '@asyncapi/parser/cjs';
import { applyProxyToPath } from '@utils/proxy';

export default class Models extends Command {
  static description = 'Generates typed models';
  private validationService = new ValidationService();
  static readonly args = ModelinaArgs as any;

  static readonly flags = {
    ...modelsFlags(),
    ...proxyFlags(),
  };
   
  async run() {
    const { args, flags } = await this.parse(Models);
    let { language, file } = args;
    let { output } = flags;
    const { proxyPort, proxyHost } = flags;

    const interactive = !flags['no-interactive'];

    if (!interactive) {
      intro(inverse('AsyncAPI Generate Models'));

      const parsedArgs = await this.parseArgs(args, output);
      language = parsedArgs.language;
      file = parsedArgs.file;
      output = parsedArgs.output;
    }

    const fileWithProxy = applyProxyToPath(file, proxyHost, proxyPort);
    const inputFile = (await load(fileWithProxy)) || (await load());

    const result = await this.validationService.parseDocument(
      inputFile,
      {},
      flags as ValidationOptions,
    );
    if (!result.success) {
      this.error(`Failed to parse the AsyncAPI document: ${result.error}`, {
        exit: 1,
      });
    } else if (!result.data) {
      this.error('No data returned from parsing the AsyncAPI document.', {
        exit: 1,
      });
    }

    const { document, diagnostics, status } = result.data;

    if (!document || status === 'invalid') {
      const severityErrors = diagnostics.filter((obj) => obj.severity === 0);
      this.log(
        `Input is not a correct AsyncAPI document so it cannot be processed.${this.validationService.formatDiagnosticsOutput(severityErrors, 'stylish', 'error')}`,
      );
      return;
    }
    if (flags['log-diagnostics'] && inputFile) {
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

    const logger = {
      info: (message: string) => {
        this.log(message);
      },
      debug: (message: string) => {
        this.debug(message);
      },
      warn: (message: string) => {
        this.warn(message);
      },
      error: (message: string) => {
        this.error(message);
      },
    };

    const s = spinner();
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
        return;
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
    } catch (error) {
      s.stop(green('Failed to generate models'));

      if (error instanceof Error) {
        this.error(error.message);
      } else {
        this.error('An unknown error occurred during model generation.');
      }
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
}
