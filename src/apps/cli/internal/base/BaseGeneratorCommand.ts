import Command from '@cli/internal/base';
// eslint-disable-next-line
// @ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';
import path from 'path';
import os from 'os';

import { load, Specification } from '@models/SpecificationFile';
import { ValidationError } from '@errors/validation-error';
import { GeneratorError } from '@errors/generator-error';
import { Parser } from '@asyncapi/parser';
import { isCancel, spinner } from '@clack/prompts';
import { yellow, magenta } from 'picocolors';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { generateArgs } from '@cli/internal/args/generate.args';
import { watcherHandler, runWatchMode } from '@utils/generate/watcher';
import { getMapBaseUrlToFolderResolver } from '@utils/generate/mapBaseUrl';
import { promptForAsyncAPIPath, promptForOutputDir } from '@utils/generate/prompts';
import { ParsedFlags } from '@models/generate/Flags';

export interface GeneratorOptions {
  forceWrite: boolean;
  install: boolean;
  debug: boolean;
  templateParams: any;
  noOverwriteGlobs: string[];
  mapBaseUrlToFolder: any;
  disabledHooks: Record<string, string>;
  registry: {
    url?: string;
    auth?: string;
    token?: string;
  };
}

export abstract class BaseGeneratorCommand extends Command {
  static readonly flags = {
    ...proxyFlags(),
  };

  static args = {
    ...generateArgs,
  };

  parser = new Parser();

  protected async buildGeneratorOptions(flags: any, parsedFlags: ParsedFlags): Promise<GeneratorOptions> {
    return {
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
  }

  protected applyProxyConfiguration(asyncapi: string, proxyHost?: string, proxyPort?: string): string {
    if (proxyHost && proxyPort) {
      const proxyUrl = `http://${proxyHost}:${proxyPort}`;
      return `${asyncapi}+${proxyUrl}`;
    }
    return asyncapi;
  }

  protected async handleWatchMode(
    asyncapi: string,
    template: string,
    output: string,
    options: GeneratorOptions,
    genOption: any,
    interactive: boolean
  ): Promise<void> {
    const watcher = watcherHandler(this, asyncapi, template, output, options, genOption, interactive);
    await runWatchMode(this, asyncapi, template, output, AsyncAPIGenerator, watcher);
  }

  protected buildGenOption(flags: any, parsedFlags: ParsedFlags): any {
    const genOption: any = {};
    if (flags['map-base-url']) {
      genOption.resolve = { resolve: getMapBaseUrlToFolderResolver(parsedFlags.mapBaseUrlToFolder) };
    }
    return genOption;
  }

  protected async generate(
    asyncapi: string | undefined,
    template: string,
    output: string,
    options: GeneratorOptions,
    genOption: any,
    interactive = true
  ): Promise<void> {
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

  protected async parseCommonArgs(
    args: Record<string, any>,
    output?: string
  ): Promise<{ asyncapi: string; output: string }> {
    let asyncapi = args['asyncapi'];
    const cancellationMessage = 'Operation cancelled';

    if (!asyncapi) {
      asyncapi = await promptForAsyncAPIPath();
    }

    if (isCancel(asyncapi)) {
      this.error(cancellationMessage, { exit: 1 });
    }

    if (!output) {
      output = await promptForOutputDir();
    }

    if (isCancel(output)) {
      this.error(cancellationMessage, { exit: 1 });
    }

    return { asyncapi, output };
  }

  protected async loadAsyncAPIInput(asyncapi: string) {
    return (await load(asyncapi)) || (await load());
  }

  protected handleCancellation(value: any): void {
    if (isCancel(value)) {
      this.error('Operation cancelled', { exit: 1 });
    }
  }
}
