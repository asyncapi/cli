import { flags } from '@oclif/command';
import Command from '../base';
import Generator from '@asyncapi/generator';
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
            multiple: true,
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
        const { args, flags } = this.parse(Generate);
        const asyncapi = await load(args['asyncapi'])
        const template = args['template'];

        const generator = new Generator(template, flags.output || path.resolve(os.tmpdir(), 'asyncapi-generator'), {
            forceWrite: flags['force-write'],
            install: flags.install,
            debug: flags.debug,
            templateParams: flags.param
        });

        try {
            await generator.generateFomString(asyncapi.text());
        } catch (error) {
            throw error;
        }
    }
}