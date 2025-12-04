import Command from '@cli/internal/base';
// eslint-disable-next-line
// @ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';

import { load, Specification } from '@models/SpecificationFile';
import { ValidationError } from '@errors/validation-error';
import { GeneratorError } from '@errors/generator-error';
import { Parser } from '@asyncapi/parser';
import { isCancel } from '@clack/prompts';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { applyProxyConfiguration } from '@/utils/proxy';
import { generateArgs } from '@cli/internal/args/generate.args';
import { watcherHandler, runWatchMode } from '@utils/generate/watcher';
import { getMapBaseUrlToFolderResolver } from '@utils/generate/mapBaseUrl';
import { promptForAsyncAPIPath, promptForOutputDir } from '@utils/generate/prompts';
import { ParsedFlags } from '@models/generate/Flags';
import { GeneratorService } from '@services/generator.service';

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
  protected generatorService = new GeneratorService();

  protected async buildGeneratorOptions(flags: Record<string, unknown>, parsedFlags: ParsedFlags): Promise<GeneratorOptions> {
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

  protected applyProxyConfigurationToPath(asyncapi: string, proxyHost?: string, proxyPort?: string): string {
    return applyProxyConfiguration(asyncapi, proxyHost, proxyPort);
  }

  protected async handleWatchMode(
    asyncapi: string,
    template: string,
    output: string,
    options: GeneratorOptions,
    genOption: Record<string, unknown>,
    interactive: boolean
  ): Promise<void> {
    const watcher = watcherHandler(this, asyncapi, template, output, options, genOption, interactive);
    await runWatchMode(this, asyncapi, template, output, AsyncAPIGenerator, watcher);
  }

  protected buildGenOption(flags: Record<string, unknown>, parsedFlags: ParsedFlags): Record<string, unknown> {
    const genOption: Record<string, unknown> = {};
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
    genOption: Record<string, unknown>,
    interactive = true
  ): Promise<void> {
    const specification = await this.loadSpecificationSafely(asyncapi);
    
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

  protected async parseCommonArgs(
    args: Record<string, unknown>,
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

  protected handleCancellation(value: unknown): void {
    if (isCancel(value)) {
      this.error('Operation cancelled', { exit: 1 });
    }
  }

  protected async loadSpecificationSafely(asyncapi: string | undefined): Promise<Specification> {
    try {
      return await load(asyncapi);
    } catch (err: unknown) {
      return this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: asyncapi,
        }),
        { exit: 1 },
      );
    }
  }
}
