import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
// eslint-disable-next-line
// @ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';
import path from 'path';
import fs from 'fs';
import { load, Specification } from '@models/SpecificationFile';
import { isLocalTemplate, Watcher } from '@/utils/fileWatcher';
import { ValidationError } from '@errors/validation-error';
import { GeneratorError } from '@errors/generator-error';
import { Parser } from '@asyncapi/parser';
import { intro, isCancel, text } from '@clack/prompts';
import { inverse, yellow, magenta, green, red } from 'picocolors';
import { fromTemplateFlags } from '@cli/internal/flags/generate/fromTemplate.flags';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { IMapBaseUrlToFlag } from '@/interfaces';
import { GeneratorService } from '@services/generator.service';

interface ParsedFlags {
  params: Record<string, string>,
  disableHooks: Record<string, string>,
  mapBaseUrlToFolder: IMapBaseUrlToFlag
}

export default class Template extends Command {
  static description = 'Generates whatever you want using templates compatible with AsyncAPI Generator.';
  private generatorService = new GeneratorService(true);
  static examples = [
    'asyncapi generate fromTemplate asyncapi.yaml @asyncapi/html-template --param version=1.0.0 singleFile=true --output ./docs --force-write'
  ];

  static readonly flags = {
    ...fromTemplateFlags(),
    ...proxyFlags()
  };

  static args = {
    asyncapi: Args.string({ description: '- Local path, url or context-name pointing to AsyncAPI file', required: false }),
    template: Args.string({ description: '- Name of the generator template like for example @asyncapi/html-template or https://github.com/asyncapi/html-template', required: false }),
  };

  parser = new Parser();

  async run() {
    const { args, flags } = await this.parse(Template); // NOSONAR
    const interactive = !flags['no-interactive'];
    let asyncapi = args['asyncapi'] ?? '';
    let template = args['template'] ?? '';
    let output = flags.output as string;
    const {proxyPort,proxyHost} = flags;
    if (interactive) {
      intro(inverse('AsyncAPI Generator'));

      const parsedArgs = await this.parseArgs(args, output);
      asyncapi = parsedArgs.asyncapi;
      template = parsedArgs.template;
      output = parsedArgs.output;
    }

    const parsedFlags = this.parseFlags(flags['disable-hook'], flags['param'], flags['map-base-url'], flags['registry.url'], flags['registry.auth'], flags['registry.token']);
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
    this.metricsMetadata.template = template;

    const watchTemplate = flags['watch'];
    const genOption: any = {};
    if (flags['map-base-url']) {
      genOption.resolve = { resolve: this.getMapBaseUrlToFolderResolver(parsedFlags.mapBaseUrlToFolder) };
    }

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

    if (flags['use-new-generator']) {
      this.log('Generation in progress. Keep calm and wait a bit');
      const result = await this.generatorService.generateUsingNewGenerator(specification, template, output, options, genOption);
      if (!result.success) {
        throw new GeneratorError(new Error(result.error));
      } else {
        this.log(result.data?.logs?.join('\n'));
      }
    } else {
      const result = await this.generatorService.generate(specification, template, output, options, genOption, interactive);
      if (!result.success) {
        throw new GeneratorError(new Error(result.error));
      }
    }
    if (watchTemplate) {
      const watcherHandler = this.watcherHandler(asyncapi, template, output, options, genOption, interactive);
      await this.runWatchMode(asyncapi, template, output, watcherHandler);
    }
  }

  private async parseArgs(args: Record<string, any>, output?: string): Promise<{ asyncapi: string; template: string; output: string; }> {
    let asyncapi = args['asyncapi'];
    let template = args['template'];
    const cancellationMessage = 'Operation cancelled';

    if (!asyncapi) {
      asyncapi = await text({
        message: 'Please provide the path to the AsyncAPI document',
        placeholder: 'asyncapi.yaml',
        defaultValue: 'asyncapi.yaml',
        validate(value: string) {
          if (!value) {
            return 'The path to the AsyncAPI document is required';
          } else if (!fs.existsSync(value)) {
            return 'The file does not exist';
          }
        }
      });
    }

    if (isCancel(asyncapi)) {
      this.error(cancellationMessage, { exit: 1 });
    }

    if (!template) {
      template = await text({
        message: 'Please provide the name of the generator template',
        placeholder: '@asyncapi/html-template',
        defaultValue: '@asyncapi/html-template',
      });
    }

    if (!output) {
      output = await text({
        message: 'Please provide the output directory',
        placeholder: './docs',
        validate(value: string) {
          if (!value) {
            return 'The output directory is required';
          } else if (typeof value !== 'string') {
            return 'The output directory must be a string';
          }
        }
      }) as string;
    }

    if (isCancel(output) || isCancel(template)) {
      this.error(cancellationMessage, { exit: 1 });
    }

    return { asyncapi, template, output };
  }

  private disableHooksParser(inputs?: string[]) {
    if (!inputs) { return {}; }
    const disableHooks: Record<string, any> = {};
    
    for (const input of inputs) {
      const [hookType, hookNames] = input.split(/=/);
      if (!hookType) { throw new Error('Invalid --disable-hook flag. It must be in the format of: --disable-hook <hookType> or --disable-hook <hookType>=<hookName1>,<hookName2>,...'); }
      if (hookNames) {
        disableHooks[String(hookType)] = hookNames.split(',');
      } else {
        disableHooks[String(hookType)] = true;
      }
    }
    return disableHooks;
  }

  private parseFlags(disableHooks?: string[], params?: string[], mapBaseUrl?: string, registryUrl?: string, registryAuth?: string, registryToken?: string): ParsedFlags {
    return {
      params: this.paramParser(params),
      disableHooks: this.disableHooksParser(disableHooks),
      mapBaseUrlToFolder: this.mapBaseURLParser(mapBaseUrl),
      registryURLValidation: this.registryURLParser(registryUrl),
      registryAuthentication: this.registryValidation(registryUrl, registryAuth, registryToken)

    } as ParsedFlags;
  }

  private registryURLParser(input?: string) {
    if (!input) { return; }
    const isURL = /^https?:/;
    if (!isURL.test(input.toLowerCase())) {
      throw new Error('Invalid --registry-url flag. The param requires a valid http/https url.');
    }
  }
  private async registryValidation(registryUrl?: string, registryAuth?: string, registryToken?: string) {
    if (!registryUrl) { return; }
    try {
      const response = await fetch(registryUrl as string);
      if (response.status === 401 && !registryAuth && !registryToken) {
        this.error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken', { exit: 1 });
      }
    } catch (error: any) {
      this.error(`Can't fetch registryURL: ${registryUrl}`, { exit: 1 });
    }
  }
  private paramParser(inputs?: string[]) {
    if (!inputs) { return {}; }
    const params: Record<string, any> = {};
    for (const input of inputs) {
      if (!input.includes('=')) { throw new Error(`Invalid param ${input}. It must be in the format of --param name1=value1 name2=value2 `); }
      const [paramName, paramValue] = input.split(/=(.+)/, 2);
      params[String(paramName)] = paramValue;
    }
    return params;
  }

  private mapBaseURLParser(input?: string) {
    if (!input) { return; }
    const mapBaseURLToFolder: any = {};
    const re = /(.*):(.*)/g; // NOSONAR
    let mapping: any[] | null = [];
    if ((mapping = re.exec(input)) === null || mapping.length !== 3) {
      throw new Error('Invalid --map-base-url flag. A mapping <url>:<folder> with delimiter : expected.');
    }

    mapBaseURLToFolder.url = mapping[1].replace(/\/$/, '');
    mapBaseURLToFolder.folder = path.resolve(mapping[2]);

    const isURL = /^https?:/;
    if (!isURL.test(mapBaseURLToFolder.url.toLowerCase())) {
      throw new Error('Invalid --map-base-url flag. The mapping <url>:<folder> requires a valid http/https url and valid folder with delimiter `:`.');
    }

    return mapBaseURLToFolder;
  }

  private async runWatchMode(asyncapi: string | undefined, template: string, output: string, watchHandler: ReturnType<typeof this.watcherHandler>) {
    const specification = await load(asyncapi);

    const watchDir = path.resolve(template);
    const outputPath = path.resolve(watchDir, output);
    const transpiledTemplatePath = path.resolve(watchDir, AsyncAPIGenerator.TRANSPILED_TEMPLATE_LOCATION);
    const ignorePaths = [outputPath, transpiledTemplatePath];
    const specificationFile = specification.getFilePath();

    // Template name is needed as it is not always a part of the cli commad
    // There is a use case that you run generator from a root of the template with `./` path
    let templateName = '';
    try {
      // eslint-disable-next-line
      templateName = require(path.resolve(watchDir, 'package.json')).name;
    } catch (err: any) {
      // intentional
    }

    let watcher;
    if (specificationFile) { // is local AsyncAPI file
      this.log(`[WATCHER] Watching for changes in the template directory ${magenta(watchDir)} and in the AsyncAPI file ${magenta(specificationFile)}`);
      watcher = new Watcher([specificationFile, watchDir], ignorePaths);
    } else {
      this.log(`[WATCHER] Watching for changes in the template directory ${magenta(watchDir)}`);
      watcher = new Watcher(watchDir, ignorePaths);
    }

    // Must check template in its installation path in generator to use isLocalTemplate function
    if (!await isLocalTemplate(path.resolve(AsyncAPIGenerator.DEFAULT_TEMPLATES_DIR, templateName))) {
      this.warn(`WARNING: ${template} is a remote template. Changes may be lost on subsequent installations.`);
    }

    await watcher.watch(watchHandler, (paths: any) => {
      this.error(`[WATCHER] Could not find the file path ${paths}, are you sure it still exists? If it has been deleted or moved please rerun the generator.`, {
        exit: 1,
      });
    });
  }

  private watcherHandler(asyncapi: string, template: string, output: string, options: Record<string, any>, genOption: any, interactive: boolean): (changedFiles: Record<string, any>) => Promise<void> {
    return async (changedFiles: Record<string, any>): Promise<void> => {
      console.clear();
      console.log('[WATCHER] Change detected');
      for (const [, value] of Object.entries(changedFiles)) {
        let eventText;
        switch (value.eventType) {
        case 'changed':
          eventText = green(value.eventType);
          break;
        case 'removed':
          eventText = red(value.eventType);
          break;
        case 'renamed':
          eventText = yellow(value.eventType);
          break;
        default:
          eventText = yellow(value.eventType);
        }
        this.log(`\t${magenta(value.path)} was ${eventText}`);
      }

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

      try {
        const result = await this.generatorService.generate(specification, template, output, options, genOption, interactive);
        if (!result.success) {
          throw new GeneratorError(new Error(result.error));
        }
      } catch (err: any) {
        throw new GeneratorError(err);
      }
    };
  }

  private getMapBaseUrlToFolderResolver = (urlToFolder: IMapBaseUrlToFlag) => {
    return {
      order: 1,
      canRead() {
        return true;
      },
      read(file: any) {
        const baseUrl = urlToFolder.url;
        const baseDir = urlToFolder.folder;

        return new Promise(((resolve, reject) => {
          let localpath = file.url;
          localpath = localpath.replace(baseUrl, baseDir);
          try {
            fs.readFile(localpath, (err, data) => {
              if (err) {
                reject(`Error opening file "${localpath}"`);
              } else {
                resolve(data);
              }
            });
          } catch (err) {
            reject(`Error opening file "${localpath}"`);
          }
        }));
      }
    };
  };
}
