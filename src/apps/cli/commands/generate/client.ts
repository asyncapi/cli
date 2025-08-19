import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
// eslint-disable-next-line
// @ts-ignore
import { listBakedInTemplates } from 'generator-v2';
import AsyncAPIGenerator from 'generator-v2';
import path from 'path';
import os from 'os';
import { load, Specification } from '@models/SpecificationFile';
import { ValidationError } from '@errors/validation-error';
import { GeneratorError } from '@errors/generator-error';
import { Parser } from '@asyncapi/parser';
import { intro, isCancel, spinner } from '@clack/prompts';
import { inverse, yellow, magenta } from 'picocolors';
import { clientsFlags } from '@cli/internal/flags/generate/clients.flags';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { generateArgs } from '@cli/internal/args/generate.args';
import { getMapBaseUrlToFolderResolver } from '@utils/generate/mapBaseUrl';
import { parseGeneratorFlags } from '@utils/generate/flags';
import { watcherHandler, runWatchMode } from '@utils/generate/watcher';
import { promptForAsyncAPIPath, promptForLanguage, promptForOutputDir } from '@utils/generate/prompts';
import { availableLanguages, AvailableLanguageType, getDefaultLanguage } from '@models/generate/ClientLanguages';

export default class Client extends Command {
  static description = `Generates clients baked-in AsyncAPI Generator. Available for: ${availableLanguages.join(', ')}. If some language is not supported or you want to improve existing client, join us at https://github.com/asyncapi/generator`;

  static examples = [
    'asyncapi generate client javascript asyncapi.yaml --param version=1.0.0 singleFile=true --output ./docs --force-write'
  ];

  static readonly flags = {
    ...clientsFlags(),
    ...proxyFlags()
  };

  static args = {
    language: Args.string({ description: `The language you want the client generated for. Available target languages: ${availableLanguages.join(', ')}`, required: true }),
    ...generateArgs
  };

  parser = new Parser();

  async run() {
    const { args, flags } = await this.parse(Client); // NOSONAR
    const interactive = !flags['no-interactive'];
    let asyncapi = args['asyncapi'] ?? '';
    let language = args['language'] as AvailableLanguageType;
    let output = flags.output as string;
    const {proxyPort,proxyHost} = flags;
    if (interactive) {
      intro(inverse('Client generation with AsyncAPI Generator'));

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

    const options = {
      forceWrite: flags['force-write'],
      install: flags.install,
      debug: flags.debug,
      templateParams: parsedFlags.params,
      noOverwriteGlobs: flags['no-overwrite'],
      mapBaseUrlToFolder: parsedFlags.mapBaseUrlToFolder,
      disabledHooks: parsedFlags.disableHooks,
      registry: {
        url: flags['registry-url'],
        auth: flags['registry-auth'],
        token: flags['registry-token']
      }
    };
    
    if (proxyHost && proxyPort) {
      const proxyUrl = `http://${proxyHost}:${proxyPort}`;
      asyncapi = `${asyncapi}+${proxyUrl}`;
    }
    const asyncapiInput = (await load(asyncapi)) || (await load());

    this.specFile = asyncapiInput;
    this.metricsMetadata.language = language;

    const watchTemplate = flags['watch'];
    const genOption: any = {};
    if (flags['map-base-url']) {
      genOption.resolve = { resolve: getMapBaseUrlToFolderResolver(parsedFlags.mapBaseUrlToFolder) };
    }

    await this.generate(asyncapi, template, output, options, genOption);

    if (watchTemplate) {
      const watcher = watcherHandler(this, asyncapi, template, output, options, genOption, interactive);
      await runWatchMode(this, asyncapi, template, output, AsyncAPIGenerator, watcher);
    }
  }

  private async parseArgs(args: Record<string, any>, output?: string): Promise<{ asyncapi: string; language: string; output: string; }> {
    let asyncapi = args['asyncapi'];
    let language = args['language'] as AvailableLanguageType;
    const cancellationMessage = 'Operation cancelled';

    if (!asyncapi) {
      asyncapi = await promptForAsyncAPIPath();
    }

    if (isCancel(asyncapi)) {
      this.error(cancellationMessage, { exit: 1 });
    }

    if (!language) {
      const defaultLanguage = getDefaultLanguage();
      language = await promptForLanguage(defaultLanguage) as AvailableLanguageType;
    }

    if (!output) {
      output = await promptForOutputDir();
    }

    if (isCancel(output) || isCancel(language)) {
      this.error(cancellationMessage, { exit: 1 });
    }

    return { asyncapi, language, output };
  }

  private async generate(asyncapi: string | undefined, template: string, output: string, options: any, genOption: any, interactive = true) {
    let specification: Specification;
    try {
      specification = await load(asyncapi);
    } catch (err: any) {
      return this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: asyncapi,
        }),
        { exit: 1 },
      );
    }

    const generator = new AsyncAPIGenerator(template, output || path.resolve(os.tmpdir(), 'asyncapi-generator'), options);
    const s = interactive ? spinner() : { start: () => null, stop: (string: string) => console.log(string) };
    s.start('Generation in progress. Keep calm and wait a bit');
    try {
      await generator.generateFromString(specification.text(), { ...genOption, path: asyncapi });
    } catch (err: any) {
      s.stop('Generation failed');
      throw new GeneratorError(err);
    }
    s.stop(`${yellow('Check out your shiny new generated files at ') + magenta(output) + yellow('.')}\n`);
  }

  private getTemplateName(language: AvailableLanguageType): string {
    const template = listBakedInTemplates({ type: 'client' }).find((template: any) => {
      return template.target === language;
    })?.name;

    if (!template) {
      this.log(`❌ Client generation for "${language}" is not yet available.`);
      this.log(`✅ Available languages: ${availableLanguages.join(', ')}`);
      this.log('🙏 Help us create the missing one: https://github.com/asyncapi/generator.');
      this.exit(1);
    }

    return template;
  }
}
