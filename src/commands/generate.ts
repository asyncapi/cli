import { flags } from '@oclif/command';
import Command from '../base';
//@ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';
import path from 'path';
import os from 'os';
import { load } from '../models/SpecificationFile';

export default class Generate extends Command {
    static description = 'Generator is a tool that you can use to generate whatever you want basing on the AsyncAPI specification file as an input.';

    static examples: string[] | undefined = [
      'asyncapi generate asyncapi.yaml @asyncapi/html-template'
    ]

    static flags = {
      help: flags.help({ char: 'h' }),
      'disable-hook': flags.string({
        char: 'd',
        description: 'disable a specific hook type or hooks from a given hook type'
      }),
      install: flags.boolean({
        char: 'i',
        default: false,
        description: 'installs the template and its dependencies (defaults to false)'
      }),
      debug: flags.boolean({
        description: 'to enable specific errors in the console'
      }),
      'no-overwrite': flags.string({
        char: 'n',
        description: 'glob or path of the file(s) to skip when regenerating'
      }),
      output: flags.string({
        char: 'o',
        description: 'directory where to put the generated files (defaults to current directory)'
      }),
      'force-write': flags.boolean({
        default: false,
        description: 'force writing of the generated files to given directory even if it is a git repo with unstaged files or not empty dir (defaults to false)'
      }),
      'watch-tempalte': flags.boolean({
        description: 'watches the template directory and the AsyncAPI document, and re-generate the files when changes occur. Ignores the output directory.'
      }),
      param: flags.string({
        char: 'p',
        description: 'additional param to pass to templates',
      }),
      'map-base-url': flags.string({
        description: ' maps all schema references from base url to local folder'
      })
    }

    static args = [
      { name: 'asyncapi', description: 'Local path or url pointing to AsyncAPI specification file', required: true },
      { name: 'template', description: 'Name of the generator template like for example @asyncapi/html-template or https://github.com/asyncapi/html-template' }
    ]

    async run() {
      const { args, flags } = this.parse(Generate); // NOSONAR
      const asyncapi = await load(args['asyncapi']);
      const template = args['template'];

      const params = this.paramParser(flags.param as string);
      const disableHooks = this.disableHooksParser(flags['disable-hook'] as string);
      const mapBaseURLToFolder = this.mapBaseURLParser(flags['map-base-url'] as string);

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

    private paramParser = (input: string) => {
      const params: Record<string, any> = {};
      if (!input.includes('=')) {throw new Error(`Invalid param ${input}. It must be in the format of --param name=value. `);}
      const [paramName, paramValue] = input.split(/=(.+)/, 2);
      params[paramName] = paramValue;
      return params;
    }

    private disableHooksParser = (input: string) => {
      const disableHooks: Record<string, any> = {};
      const [hookType, hookNames] = input.split(/=/);
      if (!hookType) {throw new Error('Invalid --disable-hook flag. It must be in the format of: --disable-hook <hookType> or --disable-hook <hookType>=<hookName1>,<hookName2>,...');}
      if (hookNames) {
        disableHooks[hookType] = hookNames.split(',');
      } else {
        disableHooks[hookType] = true;
      }

      return disableHooks;
    }

    private mapBaseURLParser = (input: string) => {
      const mapBaseUrl: any = {};
      const re = /(.*):(.*)/g; // NOSONAR
      let mapping: any[] | null = [];
      if ((mapping = re.exec(input)) === null || mapping.length !== 3) {
        throw new Error('Invalid --map-base-url flag. A mapping <url>:<folder> with delimiter : expected.');
      }

      mapBaseUrl.url = mapping[1].replace(/\/$/, '');
      mapBaseUrl.folder = path.resolve(mapping[2]);

      const isURL = /^https?:/;
      if (!isURL.test(mapBaseUrl.url.toLowerCase())) {
        throw new Error('Invalid --map-base-url flag. The mapping <url>:<folder> requires a valid http/https url and valid folder with delimiter `:`.');
      }

      return mapBaseUrl;
    }
}
