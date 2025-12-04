import { Args } from '@oclif/core';
import { BaseGeneratorCommand } from '@cli/internal/base/BaseGeneratorCommand';
// eslint-disable-next-line
// @ts-ignore
import { listBakedInTemplates } from 'generator-v2';
import { intro, note } from '@clack/prompts';
import { inverse, yellow } from 'picocolors';
import { clientsFlags } from '@cli/internal/flags/generate/clients.flags';
import { parseGeneratorFlags } from '@utils/generate/flags';
import { promptForLanguage } from '@utils/generate/prompts';
import { availableLanguages, AvailableLanguageType, getDefaultLanguage } from '@models/generate/ClientLanguages';
import { GeneratorError } from '@errors/generator-error';

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
    const interactive = !flags['no-interactive'];
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
    this.metricsMetadata.language = language;

    const watchTemplate = flags['watch'];
    const genOption = this.buildGenOption(flags, parsedFlags);

    // Use GeneratorService with new generator (v2) for client generation
    const specification = await this.loadSpecificationSafely(asyncapi);
    const result = await this.generatorService.generateUsingNewGenerator(
      specification,
      template,
      output,
      options as any, // GeneratorService expects different options interface
      genOption,
    );
    
    if (!result.success) {
      throw new GeneratorError(new Error(result.error));
    }
    
    this.log(result.data?.logs?.join('\n'));

    if (watchTemplate) {
      await this.handleWatchMode(asyncapi, template, output, options, genOption, interactive);
    }
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
      this.log(`❌ Client generation for "${language}" is not yet available.`);
      this.log(`✅ Available languages: ${availableLanguages.join(', ')}`);
      this.log('🙏 Help us create the missing one. Start discussion at: https://github.com/asyncapi/generator/issues.');
      this.exit(1);
    }

    return template;
  }
}
