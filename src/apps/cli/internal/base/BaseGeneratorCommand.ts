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
import { generateArgs } from '@cli/internal/args/generate.args';
import { watcherHandler, runWatchMode } from '@utils/generate/watcher';
import { getMapBaseUrlToFolderResolver } from '@utils/generate/mapBaseUrl';
import { promptForAsyncAPIPath, promptForOutputDir } from '@utils/generate/prompts';
import { ParsedFlags } from '@models/generate/Flags';
import { GeneratorService } from '@services/generator.service';
import { applyProxyToPath } from '@utils/proxy';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES, CliErrorCode } from '@errors/error-codes';
import { getErrorMessage } from '@utils/error-handler';
import path from 'node:path';
import { describeSource, listFiles } from '@cli/internal/output/source';
import type { StructuredOutput } from '@cli/internal/output/types';
import { parseGeneratorFlags } from '@utils/generate/flags';

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

export interface GenerationRun {
  flags: any;
  asyncapi: string;
  template: string;
  output: string;
  interactive: boolean;
  message: string;
  extraData?: Record<string, unknown>;
  printLogs: (logs: string[]) => void;
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
    return applyProxyToPath(asyncapi, proxyHost, proxyPort) ?? asyncapi;
  }

  protected async handleWatchMode(
    asyncapi: string,
    template: string,
    output: string,
    options: GeneratorOptions,
    genOption: any,
    interactive: boolean
  ): Promise<void> {
    const structured = this.jsonEnabled();
    const watcher = watcherHandler(this, asyncapi, template, output, options, genOption, interactive);
    const outputCommand = structured
      ? {
        log: () => undefined,
        warn: () => undefined,
        error: (message: string) => this.emitStructuredError(
          new ApplicationError(CLI_ERROR_CODES.WATCH_SOURCE_REMOVED, message),
        ),
      }
      : this;
    await runWatchMode(outputCommand, asyncapi, template, output, AsyncAPIGenerator, watcher);
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

  protected requireNonInteractiveArgs(
    asyncapi: string | undefined,
    output: string | undefined,
    additional?: { name: string; value: string | undefined },
  ): { asyncapi: string; output: string } {
    const missing = [
      ...(!asyncapi ? ['AsyncAPI document'] : []),
      ...(!output ? ['output directory'] : []),
      ...(additional && !additional.value ? [additional.name] : []),
    ];
    if (missing.length > 0) {
      throw new ApplicationError(
        CLI_ERROR_CODES.CLI_ARGUMENT_REQUIRED,
        `Missing required generation input: ${missing.join(', ')}.`,
      );
    }
    return { asyncapi: asyncapi as string, output: output as string };
  }

  protected generationError(
    error: unknown,
    fallback: CliErrorCode = CLI_ERROR_CODES.GENERATION_FAILED,
    details?: unknown,
  ): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }
    const message = getErrorMessage(error, 'Generation failed');
    let code = fallback;
    if ((/does not support AsyncAPI v\d|document version.*not supported/i).test(message)) {
      code = CLI_ERROR_CODES.TEMPLATE_DOCUMENT_VERSION_UNSUPPORTED;
    } else if ((/invalid asyncapi|asyncapi document.*invalid|parser error|could not parse|failed to parse|validation error/i).test(message)) {
      code = CLI_ERROR_CODES.ASYNCAPI_DOCUMENT_INVALID;
    } else if ((/template.*not (found|exist)|could not find.*template/i).test(message)) {
      code = CLI_ERROR_CODES.TEMPLATE_NOT_FOUND;
    } else if ((/invalid --registry-url/i).test(message)) {
      code = CLI_ERROR_CODES.GENERATOR_REGISTRY_INVALID;
    } else if ((/need to pass either registryAuth|authentication.*required/i).test(message)) {
      code = CLI_ERROR_CODES.REGISTRY_AUTH_REQUIRED;
    } else if ((/registry.*(401|403|authentication failed|unauthorized|forbidden)/i).test(message)) {
      code = CLI_ERROR_CODES.REGISTRY_AUTH_FAILED;
    } else if ((/registry.*(timed out|timeout)/i).test(message)) {
      code = CLI_ERROR_CODES.REGISTRY_TIMEOUT;
    } else if ((/(registry(URL)?.*(unreachable|can't fetch|ECONN|ENOTFOUND)|can't fetch registryURL)/i).test(message)) {
      code = CLI_ERROR_CODES.REGISTRY_UNREACHABLE;
    } else if ((/invalid param|template parameter/i).test(message)) {
      code = CLI_ERROR_CODES.GENERATOR_PARAMETER_INVALID;
    } else if ((/invalid --disable-hook|invalid hook/i).test(message)) {
      code = CLI_ERROR_CODES.GENERATOR_HOOK_INVALID;
    } else if ((/invalid --map-base-url|base url mapping/i).test(message)) {
      code = CLI_ERROR_CODES.GENERATOR_BASE_URL_MAPPING_INVALID;
    } else if ((/git repository with unstaged|output.*unsafe|not empty dir/i).test(message)) {
      code = CLI_ERROR_CODES.GENERATION_OUTPUT_UNSAFE;
    } else if ((/unsupported.*language|generation for .*not yet available/i).test(message)) {
      code = CLI_ERROR_CODES.GENERATION_LANGUAGE_UNSUPPORTED;
    }
    return new ApplicationError(code, message, { cause: error, details });
  }

  protected sourceDescriptor(input: string, specification: Specification) {
    return describeSource(input, specification);
  }

  protected async generatedFiles(output: string): Promise<string[]> {
    return listFiles(output);
  }

  /**
   * Shared generation pipeline for `generate client` and `generate fromTemplate`:
   * parses generator flags, loads the document, generates, optionally watches,
   * and returns (or, in JSON watch mode, emits) the structured result.
   */
  protected async runGeneration(run: GenerationRun): Promise<StructuredOutput | undefined> {
    const { flags, template, output, interactive, message } = run;
    const json = this.jsonEnabled();

    let parsedFlags: ParsedFlags;
    try {
      parsedFlags = await parseGeneratorFlags(
        flags['disable-hook'],
        flags['param'],
        flags['map-base-url'],
        flags['registry-url'],
        flags['registry-auth'],
        flags['registry-token'],
      );
    } catch (error) {
      throw this.generationError(error);
    }

    const options = await this.buildGeneratorOptions(flags, parsedFlags);
    const asyncapi = this.applyProxyConfiguration(run.asyncapi, flags.proxyHost, flags.proxyPort);
    if (!json) {
      this.specFile = await this.loadAsyncAPIInput(asyncapi);
    }

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

    const logs = result.data?.logs ?? [];
    if (!json) {
      run.printLogs(logs);
    }

    const watch = Boolean(flags['watch']);
    if (watch) {
      await this.handleWatchMode(asyncapi, template, output, options, genOption, interactive);
    }

    const source = describeSource(run.asyncapi, specification);
    const commandResult = this.result(message, {
      source,
      ...run.extraData,
      template,
      outputDirectory: path.resolve(output),
      generatedFiles: await listFiles(output),
      logs,
      watching: watch,
      diagnostics: result.diagnostics ?? [],
      warnings: [],
    });

    if (watch && json) {
      this.emitStructuredOutput({
        ...commandResult,
        data: { ...commandResult.data, event: 'watch.started', watchedFiles: [source.resolved] },
      });
      return undefined;
    }
    return commandResult;
  }

  protected async loadAsyncAPIInput(asyncapi: string) {
    return (await load(asyncapi)) || (await load());
  }

  protected handleCancellation(value: any): void {
    if (isCancel(value)) {
      this.error('Operation cancelled', { exit: 1 });
    }
  }

  protected async loadSpecificationSafely(asyncapi: string | undefined): Promise<Specification> {
    try {
      return await load(asyncapi);
    } catch (error) {
      const validationError = new ValidationError({
        type: 'invalid-file',
        filepath: asyncapi,
      });
      const message = getErrorMessage(error, validationError.message);
      const code = (/syntax|parse|invalid asyncapi/i).test(message)
        ? CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED
        : CLI_ERROR_CODES.SPEC_FILE_NOT_FOUND;
      throw new ApplicationError(code, message, { cause: error });
    }
  }
}
