import { Args } from '@oclif/core';
import { BaseGeneratorCommand } from '@cli/internal/base/BaseGeneratorCommand';
// eslint-disable-next-line
// @ts-ignore
import { listBakedInTemplates } from '@asyncapi/generator';
import { intro, note } from '@clack/prompts';
import { inverse, yellow } from 'picocolors';
import { clientsFlags } from '@cli/internal/flags/generate/clients.flags';
import { parseGeneratorFlags } from '@utils/generate/flags';
import { promptForLanguage } from '@utils/generate/prompts';
import { availableLanguages, AvailableLanguageType, getDefaultLanguage } from '@models/generate/ClientLanguages';
import { GeneratorError } from '@errors/generator-error';
import path from 'path';

export default class Client extends BaseGeneratorCommand {
  static description = `Generates clients baked-in AsyncAPI Generator. Available for: ${availableLanguages.join(', ')}. If some language is not supported or you want to improve existing client, join us at https://github.com/asyncapi/generator`;

  static examples = [
    'asyncapi generate client javascript asyncapi.yaml --param version=1.0.0 singleFile=true --output ./docs --force-write'
  ];

  static readonly flags = {
    ...clientsFlags(),
    ...BaseGeneratorCommand.flags
  };

  static args = {
    language: Args.string({ description: `The language you want the client generated for. Available target languages: ${availableLanguages.join(', ')}`, required: true }),
    ...BaseGeneratorCommand.args
  };

  async run() {
    const { args, flags } = await this.parse(Client); // NOSONAR
    const json = this.jsonEnabled();
    const interactive = !flags['no-interactive'] && !json;
    let asyncapi = args['asyncapi'] ?? '';
    let language = args['language'] as AvailableLanguageType;
    let output = flags.output as string;
    const { proxyPort, proxyHost } = flags;
    
    if (interactive) {
      intro(inverse('Client generation with AsyncAPI Generator'));
      note(yellow('This feature is in the experimental phase. Please provide feedback at: https://github.com/asyncapi/generator/issues'));

      const parsedArgs = await this.parseArgs(args, output);
      asyncapi = parsedArgs.asyncapi;
      language = parsedArgs.language as AvailableLanguageType;
      output = parsedArgs.output;
    }

    const template = this.getTemplateName(language);

    if (json && !output) {
      output = process.cwd();
    }
    if (json && !asyncapi) {
      this.requireNonInteractiveArgs(asyncapi, output);
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
    this.metricsMetadata.language = language;

    const watchTemplate = flags['watch'];
    const genOption = this.buildGenOption(flags, parsedFlags);

    // Use GeneratorService for client generation
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
    
    if (!json) {
      this.log(result.data?.logs?.join('\n'));
    }

    if (watchTemplate) {
      await this.handleWatchMode(asyncapi, template, output, options, genOption, interactive);
    }

    const commandResult = this.result('Client generated successfully.', {
      source: this.sourceDescriptor(source, specification),
      language,
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

  private async parseArgs(args: Record<string, any>, output?: string): Promise<{ asyncapi: string; language: string; output: string; }> {
    // Use base class method for common args
    const commonArgs = await this.parseCommonArgs(args, output);
    
    let language = args['language'] as AvailableLanguageType;

    if (!language) {
      const defaultLanguage = getDefaultLanguage();
      language = await promptForLanguage(defaultLanguage) as AvailableLanguageType;
    }

    this.handleCancellation(language);

    return { 
      asyncapi: commonArgs.asyncapi, 
      language, 
      output: commonArgs.output 
    };
  }

  private getTemplateName(language: AvailableLanguageType): string {
    const template = listBakedInTemplates({ type: 'client' }).find((template: any) => {
      return template.target === language;
    })?.name;

    if (!template) {
      if (!this.jsonEnabled()) {
        this.log(`❌ Client generation for "${language}" is not yet available.`);
        this.log(`✅ Available languages: ${availableLanguages.join(', ')}`);
        this.log('🙏 Help us create the missing one. Start discussion at: https://github.com/asyncapi/generator/issues.');
      }
      throw this.generationError(new Error(`Unsupported generation language: ${language}.`));
    }

    return template;
  }
}
