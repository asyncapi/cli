import { Flags, CliUx } from '@oclif/core';
import Command from '../../base';
// eslint-disable-next-line
// @ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { load, Specification } from '../../models/SpecificationFile';
import { watchFlag } from '../../flags';
import { isLocalTemplate, Watcher } from '../../utils/generator';
import { ValidationError } from '../../errors/validation-error';
import { GeneratorError } from '../../errors/generator-error';

import type { Example } from '@oclif/core/lib/interfaces';

const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const magenta = (text: string) => `\x1b[35m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;

interface IMapBaseUrlToFlag {
  url: string,
  folder: string
}

interface ParsedFlags {
  params: Record<string, string>,
  disableHooks: Record<string, string>,
  mapBaseUrlToFolder: IMapBaseUrlToFlag
}

export default class Template extends Command {
  static description = 'Generates whatever you want using templates compatible with AsyncAPI Generator.';

  static examples: Example[] = [
    'asyncapi generate fromTemplate asyncapi.yaml @asyncapi/html-template --param version=1.0.0 singleFile=true --output ./docs --force-write'
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    'disable-hook': Flags.string({
      char: 'd',
      description: 'Disable a specific hook type or hooks from a given hook type',
      multiple: true
    }),
    install: Flags.boolean({
      char: 'i',
      default: false,
      description: 'Installs the template and its dependencies (defaults to false)'
    }),
    debug: Flags.boolean({
      description: 'Enable more specific errors in the console'
    }),
    'no-overwrite': Flags.string({
      char: 'n',
      multiple: true,
      description: 'Glob or path of the file(s) to skip when regenerating'
    }),
    output: Flags.string({
      char: 'o',
      description: 'Directory where to put the generated files (defaults to current directory)',
    }),
    'force-write': Flags.boolean({
      default: false,
      description: 'Force writing of the generated files to given directory even if it is a git repo with unstaged files or not empty dir (defaults to false)'
    }),
    watch: watchFlag(
      'Watches the template directory and the AsyncAPI document, and re-generate the files when changes occur. Ignores the output directory.'
    ),
    param: Flags.string({
      char: 'p',
      description: 'Additional param to pass to templates',
      multiple: true
    }),
    'map-base-url': Flags.string({
      description: 'Maps all schema references from base url to local folder'
    })
  }

  static args = [
    { name: 'asyncapi', description: '- Local path, url or context-name pointing to AsyncAPI file', required: true },
    { name: 'template', description: '- Name of the generator template like for example @asyncapi/html-template or https://github.com/asyncapi/html-template', required: true }
  ]

  async run() {
    const { args, flags } = await this.parse(Template); // NOSONAR

    const asyncapi = args['asyncapi'];
    const template = args['template'];
    const output = flags.output || process.cwd();
    const parsedFlags = this.parseFlags(flags['disable-hook'], flags['param'], flags['map-base-url']);
    const options = {
      forceWrite: flags['force-write'],
      install: flags.install,
      debug: flags.debug,
      templateParams: parsedFlags.params,
      noOverwriteGlobs: flags['no-overwrite'],
      mapBaseUrlToFolder: parsedFlags.mapBaseUrlToFolder,
      disabledHooks: parsedFlags.disableHooks,
    };
    const watchTemplate = flags['watch'];
    const genOption: any = {};

    if (flags['map-base-url']) {
      genOption.resolve = {resolve: this.getMapBaseUrlToFolderResolver(parsedFlags.mapBaseUrlToFolder)};
    }

    await this.generate(asyncapi, template, output, options, genOption);    

    if (watchTemplate) {
      const watcherHandler = this.watcherHandler(asyncapi, template, output, options, genOption);
      await this.runWatchMode(asyncapi, template, output, watcherHandler);
    }
  }

  private parseFlags(disableHooks?: string[], params?: string[], mapBaseUrl?: string): ParsedFlags {
    return {
      params: this.paramParser(params),
      disableHooks: this.disableHooksParser(disableHooks),
      mapBaseUrlToFolder: this.mapBaseURLParser(mapBaseUrl),
    } as ParsedFlags;
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

  private async generate(asyncapi: string | undefined, template: string, output: string, options: any, genOption: any) {
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

    CliUx.ux.action.start('Generation in progress. Keep calm and wait a bit');
    try {
      await generator.generateFromString(specification.text(), genOption);
      CliUx.ux.action.stop();
    } catch (err: any) {
      CliUx.ux.action.stop('done\n');
      throw new GeneratorError(err);
    }
    console.log(`${yellow('Check out your shiny new generated files at ') + magenta(output) + yellow('.')}\n`);
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

    watcher.watch(watchHandler, (paths: any) => {
      this.error(`[WATCHER] Could not find the file path ${paths}, are you sure it still exists? If it has been deleted or moved please rerun the generator.`, {
        exit: 1,
      });
    });
  }

  private watcherHandler(asyncapi: string, template: string, output: string, options: Record<string, any>, genOption: any): (changedFiles: Record<string, any>) => Promise<void> {
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
      try {
        await this.generate(asyncapi, template, output, options, genOption);
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
          localpath = localpath.replace(baseUrl,baseDir);
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
  }
}
