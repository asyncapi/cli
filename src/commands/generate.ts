import { Flags } from '@oclif/core';
import Command from '../base';
// @ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';
import path from 'path';
import os from 'os';
import { load } from '../models/SpecificationFile';
import { Example } from '@oclif/core/lib/interfaces';

export class GenerateFlagParser {
  private _params: Record<string, any> = {}
  private _disableHooks: Record<string, any> = {}
  private _mapBaseUrlToFolder: any = {}
  constructor(disableHook: string[], params: string[], mapBaseUrl: string) {
    params.forEach(param => this.paramParser(param));
    disableHook.forEach(hook => this.disableHooksParser(hook));
    this.mapBaseURLParser(mapBaseUrl);
  }

  params() {
    return this._params;
  }

  disableHooks(){
    return this._disableHooks;
  }

  mapBaseUrlToFolder(){
    return this._mapBaseUrlToFolder;
  }

  private paramParser(input: string) {
    if (!input.includes('=')) { throw new Error(`Invalid param ${input}. It must be in the format of --param name=value. `); }
    console.log(input);
    const [paramName, paramValue] = input.split(/=(.+)/, 2);
    console.log(paramName, paramValue);
    this._params[String(paramName)] = paramValue;
  }

  private disableHooksParser = (input: string) => {
    const [hookType, hookNames] = input.split(/=/);
    if (!hookType) { throw new Error('Invalid --disable-hook flag. It must be in the format of: --disable-hook <hookType> or --disable-hook <hookType>=<hookName1>,<hookName2>,...'); }
    if (hookNames) {
      this._disableHooks[hookType] = hookNames.split(',');
    } else {
      this._disableHooks[hookType] = true;
    }
  }

  private mapBaseURLParser = (input: string) => {
    const re = /(.*):(.*)/g; // NOSONAR
    let mapping: any[] | null = [];
    if ((mapping = re.exec(input)) === null || mapping.length !== 3) {
      throw new Error('Invalid --map-base-url flag. A mapping <url>:<folder> with delimiter : expected.');
    }

    this._mapBaseUrlToFolder.url = mapping[1].replace(/\/$/, '');
    this._mapBaseUrlToFolder.folder = path.resolve(mapping[2]);

    const isURL = /^https?:/;
    if (!isURL.test(this._mapBaseUrlToFolder.url.toLowerCase())) {
      throw new Error('Invalid --map-base-url flag. The mapping <url>:<folder> requires a valid http/https url and valid folder with delimiter `:`.');
    }
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
      description: 'glob or path of the file(s) to skip when regenerating'
    }),
    output: Flags.string({
      char: 'o',
      description: 'directory where to put the generated files (defaults to current directory)'
    }),
    'force-write': Flags.boolean({
      default: false,
      description: 'force writing of the generated files to given directory even if it is a git repo with unstaged files or not empty dir (defaults to false)'
    }),
    'watch-tempalte': Flags.boolean({
      description: 'watches the template directory and the AsyncAPI document, and re-generate the files when changes occur. Ignores the output directory.'
    }),
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
    { name: 'template', description: 'Name of the generator template like for example @asyncapi/html-template or https://github.com/asyncapi/html-template' }
  ]

  async run() {
    const { args, flags } = await this.parse(Generate); // NOSONAR
    const asyncapi = await load(args['asyncapi']);
    const template = args['template'];

    const flagParser = new GenerateFlagParser(flags['disable-hook'], flags['param'], flags['map-base-url'] as string);

    const params = flagParser.params();
    const disableHooks = flagParser.disableHooks();
    const mapBaseURLToFolder = flagParser.mapBaseUrlToFolder();

    const generator = new AsyncAPIGenerator(template, flags.output || path.resolve(os.tmpdir(), 'asyncapi-generator'), {
      forceWrite: flags['force-write'],
      install: flags.install,
      debug: flags.debug,
      templateParams: params,
      noOverwriteGlobs: flags['no-overwrite'],
      mapBaseUrlToFolder: flags['map-base-url'],
      disableHooks,
      mapBaseURLToFolder
    });
    await generator.generateFromString(asyncapi.text());
  }
}
