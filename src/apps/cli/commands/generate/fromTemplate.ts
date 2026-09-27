import { Args } from '@oclif/core';
import { BaseGeneratorCommand } from '@cli/internal/base/BaseGeneratorCommand';
import { GeneratorError } from '@errors/generator-error';
import { intro } from '@clack/prompts';
import { inverse } from 'picocolors';
import { fromTemplateFlags } from '@cli/internal/flags/generate/fromTemplate.flags';
import { parseGeneratorFlags } from '@utils/generate/flags';
import { promptForTemplate } from '@utils/generate/prompts';
import path from 'path';

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
    const json = this.jsonEnabled();
    const interactive = !flags['no-interactive'] && !json;
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

    if (json && !output) {
      output = process.cwd();
    }
    if (json && (!asyncapi || !template)) {
      this.requireNonInteractiveArgs(asyncapi, output, { name: 'template', value: template });
    }

    let parsedFlags;
    try {
      parsedFlags = await parseGeneratorFlags(
        flags['disable-hook'],
        flags['param'],
        flags['map-base-url'],
        flags['registry-url'],
        flags['registry-auth'],
        flags['registry-token']
      );
    } catch (error) {
      throw this.generationError(error);
    }

    const options = await this.buildGeneratorOptions(flags, parsedFlags);

    // Apply proxy configuration using base class method
    const source = asyncapi;
    asyncapi = this.applyProxyConfiguration(asyncapi, proxyHost, proxyPort);
    if (!json) {
      this.specFile = await this.loadAsyncAPIInput(asyncapi);
    }
    this.metricsMetadata.template = template;

    const watchTemplate = flags['watch'];
    const genOption = this.buildGenOption(flags, parsedFlags);

    const specification = await this.loadSpecificationSafely(asyncapi);
    this.specFile = specification;

    const result = await this.generatorService.generate(
      specification,
      template,
      output,
      options as any, // GeneratorService expects different options interface
      genOption,
      interactive,
    );
    if (!result.success) {
      if (json) {
        throw this.generationError(new Error(result.error), undefined, result.diagnostics);
      }
      throw new GeneratorError(new Error(result.error));
    }

    // Output logs in non-interactive mode
    if (!interactive && !json && result.data?.logs) {
      for (const log of result.data.logs) {
        this.log(log);
      }
    }
    
    if (watchTemplate) {
      await this.handleWatchMode(asyncapi, template, output, options, genOption, interactive);
    }

    const commandResult = this.result('Files generated successfully.', {
      source: this.sourceDescriptor(source, specification),
      template,
      outputDirectory: path.resolve(output),
      generatedFiles: await this.generatedFiles(output),
      logs: result.data?.logs ?? [],
      watching: Boolean(watchTemplate),
      diagnostics: result.diagnostics ?? [],
      warnings: [],
    });
    if (watchTemplate && json) {
      this.emitStructuredOutput({
        ...commandResult,
        data: {
          ...(commandResult.data ?? {}),
          event: 'watch.started',
          watchedFiles: [this.sourceDescriptor(source, specification).resolved],
        },
      });
      return;
    }
    return commandResult;
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
