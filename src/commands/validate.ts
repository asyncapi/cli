import { flags } from '@oclif/command';
import * as parser from '@asyncapi/parser';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    help: flags.help({ char: 'h' }),
    file: flags.boolean({ char: 'f', description: 'Input will be treated as a file path' }),
    context: flags.boolean({ char: 'c', description: 'Input will be treated as a context name' }),
    url: flags.boolean({ char: 'u', description: 'Input will be treated as a url' })
  }

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ]

  async run() {
    const { args, flags } = this.parse(Validate);
    const filePath = args['spec-file'];

    const specFile = await load(filePath, {
      context: flags.context,
      file: flags.file,
      url: flags.url
    });

    try {
      if (specFile.getFilePath()) {
        await parser.parse(specFile.text());
        this.log(`File ${specFile.getFilePath()} successfully validated!`);
      } else if (specFile.getFileURL()) {
        await parser.parse(specFile.text());
        this.log(`URL ${specFile.getFileURL()} successfully validated`);
      }
    } catch (error) {
      throw new ValidationError({
        type: 'parser-error',
        err: error
      });
    }
  }
}
