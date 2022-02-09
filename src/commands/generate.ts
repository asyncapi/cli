import {flags} from '@oclif/command';
import Command from '../base';
import * as generator from '@asyncapi/generator';

export default class Generate extends Command {
    static description = 'Generator is a tool that you can use to generate whatever you want basing on the AsyncAPI specification file as an input.';

    static flags = {
        help: flags.help({char: 'h'})
    }

    static args = [
        {name: 'asyncapi', description: 'Local path or url pointing to AsyncAPI specification file', required: true},
        {name: 'template', description: 'Name of the generator template like for example @asyncapi/html-template or https://github.com/asyncapi/html-template'}
    ]

    async run() {
        
    }
}