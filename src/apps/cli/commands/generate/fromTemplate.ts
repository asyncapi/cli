import { Args } from '@oclif/core';
import { BaseGeneratorCommand } from '@cli/internal/base/BaseGeneratorCommand';
import { load, Specification } from '@models/SpecificationFile';
import { ValidationError } from '@errors/validation-error';
import { GeneratorError } from '@errors/generator-error';
import { intro } from '@clack/prompts';
import { inverse } from 'picocolors';
import { fromTemplateFlags } from '@cli/internal/flags/generate/fromTemplate.flags';
import { parseGeneratorFlags } from '@utils/generate/flags';
import { promptForTemplate } from '@utils/generate/prompts';

export default class Template extends BaseGeneratorCommand {
  static description =
    'Generates whatever you want using templates compatible with AsyncAPI Generator.';
  static examples = [
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
    const interactive = !flags['no-interactive'];
    let asyncapi = args['asyncapi'] ?? '';
    let template = args['template'] ?? '';
    let output = flags.output as string;
    const { proxyPort, proxyHost } = flags;
    
    if (interactive) {
      intro(inverse('AsyncAPI Generator'));

      const parsedArgs = await this.parseArgs(args, output);
      asyncapi = parsedArgs.asyncapi;
      template = parsedArgs.template;
      output = parsedArgs.output;
    }

    const parsedFlags = parseGeneratorFlags(
      flags['disable-hook'],
      flags['param'],
      flags['map-base-url'],
      flags['registry-url'],
      flags['registry-auth'],
      flags['registry-token']
    );

    const options = await this.buildGeneratorOptions(flags, parsedFlags);

    // Apply proxy configuration using base class method
    asyncapi = this.applyProxyConfiguration(asyncapi, proxyHost, proxyPort);
    
    const asyncapiInput = await this.loadAsyncAPIInput(asyncapi);

    this.specFile = asyncapiInput;
    this.metricsMetadata.template = template;

    const watchTemplate = flags['watch'];
    const genOption = this.buildGenOption(flags, parsedFlags);

    let specification: Specification;
    try {
      specification = await load(asyncapi);
    } catch {
      return this.error(
        new ValidationError({
           
          type: 'invalid-file',
          filepath: asyncapi,
        }),
        { exit: 1 },
      );
    }

    const result = await this.generatorService.generate(
      specification,
      template,
      output,
      options as any, // GeneratorService expects different options interface
      genOption,
      interactive,
    );
    if (!result.success) {
      const errorMsg = result.error || 'Unknown error';
      const suggestions: string[] = [];

      if (errorMsg.includes('ENOENT') || errorMsg.includes('not found') || errorMsg.includes('Cannot find')) {
        suggestions.push('The template may not be installed. Try installing it first with: npm install <template-name>');
      }
      if (errorMsg.includes('invalid') || errorMsg.includes('parse') || errorMsg.includes('syntax')) {
        suggestions.push('The AsyncAPI document may be invalid or unsupported. Verify it with: asyncapi validate <document>');
      }
      if (errorMsg.includes('E404') || errorMsg.includes('404')) {
        suggestions.push('The template was not found on npm. Check the template name and try again.');
      }

      const fullMessage = suggestions.length > 0
        ? `${errorMsg}\n\nPossible causes:\n${suggestions.map(s => `  - ${s}`).join('\n')}`
        : errorMsg;

      throw new GeneratorError(new Error(fullMessage));
    }

    // Output logs in non-interactive mode
    if (!interactive && result.data?.logs) {
      for (const log of result.data.logs) {
        this.log(log);
      }
    }
    
    if (watchTemplate) {
      await this.handleWatchMode(asyncapi, template, output, options, genOption, interactive);
    }
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
