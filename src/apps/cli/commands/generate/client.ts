import { Args } from '@oclif/core';
import { BaseGeneratorCommand } from '@cli/internal/base/BaseGeneratorCommand';
// eslint-disable-next-line
// @ts-ignore
import { listBakedInTemplates } from '@asyncapi/generator';
import { intro, note } from '@clack/prompts';
import { inverse, yellow } from 'picocolors';
import { clientsFlags } from '@cli/internal/flags/generate/clients.flags';
import { promptForLanguage } from '@utils/generate/prompts';
import { availableLanguages, AvailableLanguageType, getDefaultLanguage } from '@models/generate/ClientLanguages';

export default class Client extends BaseGeneratorCommand {
  static readonly description = `Generates clients baked-in AsyncAPI Generator. Available for: ${availableLanguages.join(', ')}. If some language is not supported or you want to improve existing client, join us at https://github.com/asyncapi/generator`;

  static readonly examples = [
    'asyncapi generate client javascript asyncapi.yaml --param version=1.0.0 singleFile=true --output ./docs --force-write'
  ];

  static readonly flags = {
    ...clientsFlags(),
    ...BaseGeneratorCommand.flags
  };

  static readonly args = {
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

    this.metricsMetadata.language = language;

    return this.runGeneration({
      flags,
      asyncapi,
      template,
      output,
      interactive,
      message: 'Client generated successfully.',
      extraData: { language },
      printLogs: (logs) => this.log(logs.join('\n')),
    });
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
