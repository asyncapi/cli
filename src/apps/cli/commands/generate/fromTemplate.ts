import { Args } from '@oclif/core';
import { BaseGeneratorCommand } from '@cli/internal/base/BaseGeneratorCommand';
import { intro } from '@clack/prompts';
import { inverse } from 'picocolors';
import { fromTemplateFlags } from '@cli/internal/flags/generate/fromTemplate.flags';
import { promptForTemplate } from '@utils/generate/prompts';

export default class Template extends BaseGeneratorCommand {
  static readonly description =
    'Generates whatever you want using templates compatible with AsyncAPI Generator.';
  static readonly examples = [
    'asyncapi generate fromTemplate asyncapi.yaml @asyncapi/html-template --param version=1.0.0 singleFile=true --output ./docs --force-write',
  ];

  static readonly flags = {
    ...fromTemplateFlags(),
    ...BaseGeneratorCommand.flags,
  };

  static args = {
    ...BaseGeneratorCommand.args,
    template: Args.string({ description: '- Name of the generator template like for example @asyncapi/html-template or https://github.com/asyncapi/html-template', required: false }),
  };
   
  async run() {
    const { args, flags } = await this.parse(Template); // NOSONAR
    const json = this.jsonEnabled();
    const interactive = !flags['no-interactive'] && !json;
    let asyncapi = args['asyncapi'] ?? '';
    let template = args['template'] ?? '';
    let output = flags.output as string;
    
    if (interactive) {
      intro(inverse('AsyncAPI Generator'));

      const parsedArgs = await this.parseArgs(args, output);
      asyncapi = parsedArgs.asyncapi;
      template = parsedArgs.template;
      output = parsedArgs.output;
    }

    if (json && !output) {
      output = process.cwd();
    }
    if (json && (!asyncapi || !template)) {
      this.requireNonInteractiveArgs(asyncapi, output, { name: 'template', value: template });
    }

    this.metricsMetadata.template = template;

    return this.runGeneration({
      flags,
      asyncapi,
      template,
      output,
      interactive,
      message: 'Files generated successfully.',
      printLogs: (logs) => {
        if (!interactive) {
          for (const log of logs) {
            this.log(log);
          }
        }
      },
    });
  }

  private async parseArgs(
    args: Record<string, any>,
    output?: string,
  ): Promise<{ asyncapi: string; template: string; output: string }> {
    // Use base class method for common args
    const commonArgs = await this.parseCommonArgs(args, output);
    
    let template = args['template'];

    if (!template) {
      template = await promptForTemplate();
    }

    this.handleCancellation(template);

    return { 
      asyncapi: commonArgs.asyncapi, 
      template, 
      output: commonArgs.output 
    };
  }
}
