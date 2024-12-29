import Command from '../../core/base';
import { load } from '../../core/models/SpecificationFile';
import { formatOutput, parse, ValidateOptions } from '../../core/parser';
import { cancel, intro, isCancel, select, spinner, text } from '@clack/prompts';
import { green, inverse } from 'picocolors';
import { generateModels, Languages, ModelinaArgs } from '@asyncapi/modelina-cli';
import { modelsFlags } from '../../core/flags/generate/models.flags';

export default class Models extends Command {
  static description = 'Generates typed models';

  static readonly args = ModelinaArgs as any;

  static flags = modelsFlags();

  async run() {
    const { args, flags } = await this.parse(Models);
    let { language, file } = args;
    let { output } = flags;

    const interactive = !flags['no-interactive'];

    if (!interactive) {
      intro(inverse('AsyncAPI Generate Models'));

      const parsedArgs = await this.parseArgs(args, output);
      language = parsedArgs.language;
      file = parsedArgs.file;
      output = parsedArgs.output;
    }

    const inputFile = (await load(file)) || (await load());

    const { document, diagnostics ,status } = await parse(this, inputFile, flags as ValidateOptions);

    if (!document || status === 'invalid') {
      const severityErrors = diagnostics.filter((obj) => obj.severity === 0);
      this.log(`Input is not a correct AsyncAPI document so it cannot be processed.${formatOutput(severityErrors,'stylish','error')}`);
      return;
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
      const generatedModels = await generateModels({...flags, output}, document, logger, language as Languages);
      if (output !== 'stdout') {
        const generatedModelStrings = generatedModels.map((model) => { return model.modelName; });
        s.stop(green(`Successfully generated the following models: ${generatedModelStrings.join(', ')}`));
        return;
      }
      const generatedModelStrings = generatedModels.map((model) => {
        return `
  ## Model name: ${model.modelName}
  ${model.result}
        `;
      });
      s.stop(green(`Successfully generated the following models: ${generatedModelStrings.join('\n')}`));
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
        options: Object.keys(Languages).map((key) =>
          ({ value: key, label: key, hint: Languages[key as keyof typeof Languages] })
        ),
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
      output = await text({
        message: 'Enter the output directory or stdout to write the models to',
        defaultValue: 'stdout',
        placeholder: 'stdout',
      }) as string;
    }

    if (isCancel(output)) {
      cancel(operationCancelled);
      this.exit();
    }

    return { language, file, output: output ?? 'stdout' };
  }
}
