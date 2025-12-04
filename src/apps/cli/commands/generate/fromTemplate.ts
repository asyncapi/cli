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

const inProgressMsg = 'Generation in progress. Keep calm and wait a bit';

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

  // eslint-disable-next-line sonarjs/cognitive-complexity
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
    asyncapi = this.applyProxyConfigurationToPath(asyncapi, proxyHost, proxyPort);
    
    const asyncapiInput = await this.loadAsyncAPIInput(asyncapi);

    this.specFile = asyncapiInput;
    this.metricsMetadata.template = template;

    const watchTemplate = flags['watch'];
    const genOption = this.buildGenOption(flags, parsedFlags);

    let specification: Specification;
    try {
      specification = await load(asyncapi);
    } catch (err: any) {
      return this.error(
        new ValidationError({
          // eslint-disable-next-line sonarjs/no-duplicate-string
          type: 'invalid-file',
          filepath: asyncapi,
        }),
        { exit: 1 },
      );
    }

    if (flags['use-new-generator']) {
      this.log(inProgressMsg);
      const result = await this.generatorService.generateUsingNewGenerator(
        specification,
        template,
        output,
        options as any, // GeneratorService expects different options interface
        genOption,
      );
      if (!result.success) {
        throw new GeneratorError(new Error(result.error));
      } else {
        this.log(result.data?.logs?.join('\n'));
      }
    } else {
      const result = await this.generatorService.generate(
        specification,
        template,
        output,
        options as any, // GeneratorService expects different options interface
        genOption,
        interactive,
      );
      if (!result.success) {
        throw new GeneratorError(new Error(result.error));
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
