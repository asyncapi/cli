import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
// eslint-disable-next-line
// @ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';
import AsyncAPINewGenerator from 'generator-v2';

import path from 'path';
import os from 'os';

import { load, Specification } from '@models/SpecificationFile';
import { ValidationError } from '@errors/validation-error';
import { GeneratorError } from '@errors/generator-error';
import { Parser } from '@asyncapi/parser';
import { intro, isCancel, spinner } from '@clack/prompts';
import { inverse, yellow, magenta } from 'picocolors';
import { fromTemplateFlags } from '@cli/internal/flags/generate/fromTemplate.flags';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { GeneratorService } from '@services/generator.service';

import { generateArgs } from '@cli/internal/args/generate.args';
import { parseGeneratorFlags } from '@utils/generate/flags';
import { watcherHandler, runWatchMode } from '@utils/generate/watcher';
import { getMapBaseUrlToFolderResolver } from '@utils/generate/mapBaseUrl';
import { promptForAsyncAPIPath, promptForTemplate, promptForOutputDir } from '@utils/generate/prompts';

const inProgressMsg = 'Generation in progress. Keep calm and wait a bit';

export default class Template extends Command {
  static description =
    'Generates whatever you want using templates compatible with AsyncAPI Generator.';
  private generatorService = new GeneratorService(true);
  static examples = [
    'asyncapi generate fromTemplate asyncapi.yaml @asyncapi/html-template --param version=1.0.0 singleFile=true --output ./docs --force-write',
  ];

  static readonly flags = {
    ...fromTemplateFlags(),
    ...proxyFlags(),
  };

  static args = {
    ...generateArgs,
    template: Args.string({ description: '- Name of the generator template like for example @asyncapi/html-template or https://github.com/asyncapi/html-template', required: false }),
  };

  parser = new Parser();

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
        token: flags['registry-token'],
      },
    };

    if (proxyHost && proxyPort) {
      const proxyUrl = `http://${proxyHost}:${proxyPort}`;
      asyncapi = `${asyncapi}+${proxyUrl}`;
    }
    const asyncapiInput = (await load(asyncapi)) || (await load());

    this.specFile = asyncapiInput;
    this.metricsMetadata.template = template;

    const watchTemplate = flags['watch'];
    const genOption: any = {};
    if (flags['map-base-url']) {
      genOption.resolve = { resolve: getMapBaseUrlToFolderResolver(parsedFlags.mapBaseUrlToFolder) };
    }

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
        options,
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
        options,
        genOption,
        interactive,
      );
      if (!result.success) {
        throw new GeneratorError(new Error(result.error));
      }
    }
    if (watchTemplate) {
      const watcher = watcherHandler(this, asyncapi, template, output, options, genOption, interactive);
      await runWatchMode(this, asyncapi, template, output, AsyncAPIGenerator, watcher);
    }
  }

  private async parseArgs(
    args: Record<string, any>,
    output?: string,
  ): Promise<{ asyncapi: string; template: string; output: string }> {
    let asyncapi = args['asyncapi'];
    let template = args['template'];
    const cancellationMessage = 'Operation cancelled';

    if (!asyncapi) {
      asyncapi = await promptForAsyncAPIPath();
    }

    if (isCancel(asyncapi)) {
      this.error(cancellationMessage, { exit: 1 });
    }

    if (!template) {
      template = await promptForTemplate();
    }

    if (!output) {
      output = await promptForOutputDir();
    }

    if (isCancel(output) || isCancel(template)) {
      this.error(cancellationMessage, { exit: 1 });
    }

    return { asyncapi, template, output };
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
    s.start(inProgressMsg);
    try {
      await generator.generateFromString(specification.text(), { ...genOption, path: asyncapi });
    } catch (err: any) {
      s.stop('Generation failed');
      throw new GeneratorError(err);
    }
    s.stop(`${yellow('Check out your shiny new generated files at ') + magenta(output) + yellow('.')}\n`);
  }

  private async generateUsingNewGenerator(asyncapi: string | undefined, template: string, output: string, options: any, genOption: any) {
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
    const generator = new AsyncAPINewGenerator(template, output || path.resolve(os.tmpdir(), 'asyncapi-generator'), options);
    this.log(inProgressMsg);
    try {
      await generator.generateFromString(specification.text(), { ...genOption, path: asyncapi });
    } catch (err: any) {
      this.log('Generation failed');
      throw new GeneratorError(err);
    }
    this.log(`${yellow('Check out your shiny new generated files at ') + magenta(output) + yellow('.')}\n`);
  }
}
