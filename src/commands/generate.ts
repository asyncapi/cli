import { Flags, CliUx } from '@oclif/core';
import Command from '../base';
// eslint-disable-next-line
// @ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';
import path from 'path';
import { load } from '../models/SpecificationFile';
import { Example } from '@oclif/core/lib/interfaces';
import { watchFlag } from '../flags';

interface ParsedFlags {
  params: Record<string, string>,
  disableHooks: Record<string, string>,
  mapBaseUrlToFolder: {
    url: string,
    folder: string
  }
}

export default class Generate extends Command {
  static description = 'Generator is a tool that you can use to generate whatever you want basing on the AsyncAPI specification file as an input.';

  static examples: Example[] = [
    'asyncapi generate asyncapi.yaml @asyncapi/html-template'
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    'disable-hook': Flags.string({
      char: 'd',
      description: 'disable a specific hook type or hooks from a given hook type',
      multiple: true
    }),
    install: Flags.boolean({
      char: 'i',
      default: false,
      description: 'installs the template and its dependencies (defaults to false)'
    }),
    debug: Flags.boolean({
      description: 'to enable specific errors in the console'
    }),
    'no-overwrite': Flags.string({
      char: 'n',
      multiple: true,
      description: 'glob or path of the file(s) to skip when regenerating'
    }),
    output: Flags.string({
      char: 'o',
      description: 'directory where to put the generated files (defaults to current directory)',
      required: true
    }),
    'force-write': Flags.boolean({
      default: false,
      description: 'force writing of the generated files to given directory even if it is a git repo with unstaged files or not empty dir (defaults to false)'
    }),
    'watch-tempalte': watchFlag(
      'watches the template directory and the AsyncAPI document, and re-generate the files when changes occur. Ignores the output directory.'
    ),
    param: Flags.string({
      char: 'p',
      description: 'additional param to pass to templates',
      multiple: true
    }),
    'map-base-url': Flags.string({
      description: ' maps all schema references from base url to local folder'
    })
  }

  static args = [
    { name: 'asyncapi', description: 'Local path or url pointing to AsyncAPI specification file', required: true },
    { name: 'template', description: 'Name of the generator template like for example @asyncapi/html-template or https://github.com/asyncapi/html-template', required: true }
  ]

  async run() {
    const { args, flags } = await this.parse(Generate); // NOSONAR
    const asyncapi = await load(args['asyncapi']);
    const template = args['template'];

    const parsedFlags = this.parseFlags(flags['disable-hook'], flags['param'], flags['map-base-url']);

    const generator = new AsyncAPIGenerator(template, flags.output, {
      forceWrite: flags['force-write'],
      install: flags.install,
      debug: flags.debug,
      templateParams: parsedFlags.params,
      noOverwriteGlobs: flags['no-overwrite'],
      mapBaseUrlToFolder: parsedFlags.mapBaseUrlToFolder,
      disabledHooks: parsedFlags.disableHooks
    });
    CliUx.ux.action.start('generating template');
    await generator.generateFromString(asyncapi.text());
    CliUx.ux.action.stop();
  }

  private parseFlags(disableHooks?: string[], params?: string[], mapBaseUrl?: string): ParsedFlags {
    return {
      params: this.paramParser(params),
      disableHooks: this.disableHooksParser(disableHooks),
      mapBaseUrlToFolder: this.mapBaseURLParser(mapBaseUrl),
    } as ParsedFlags;
  }

  private paramParser(inputs?: string[]) {
    if (!inputs) {return {};}
    const params: Record<string, any> = {};
    for (const input of inputs) {
      if (!input.includes('=')) { throw new Error(`Invalid param ${input}. It must be in the format of --param name=value. `); }
      const [paramName, paramValue] = input.split(/=(.+)/, 2);
      params[String(paramName)] = paramValue;
    }
    return params;
  }

  private disableHooksParser(inputs?: string[]) {
    if (!inputs) {return {};}
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
    if (!input) {return;}
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
}
