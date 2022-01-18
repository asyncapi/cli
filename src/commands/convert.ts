import { flags } from '@oclif/command';
import * as parser from '@asyncapi/parser';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';
import { SpecificationFileNotFound } from '../errors/specification-file';
import { convert } from '@asyncapi/converter';
import { Specification } from '../models/SpecificationFile';

export default class Convert extends Command {
  static description = 'convert asyncapi documents older to newer versions';

  static flags = {
    help: flags.help({ char: 'h' }),
    file: flags.string({ char: 'f', description: 'path to the file to convert' }),
    output: flags.string({ char: 'o', description: 'name of the file where the result is saved' }),
    'target-version': flags.string({ char: 't', description: 'asyncapi version to convert to' }),
    id: flags.string({ char: 'i', description: 'application id, if needed' })
  }

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ]

  async run() {
    const { args } = this.parse(Convert);
    const filePath = args['spec-file'];
    let specFile;
    let convertedFile;

    try {
      // LOAD FILE
      specFile = await load(filePath);

      // VALIDATION
      if (specFile.getFilePath()) {
        await parser.parse(specFile.text());
        this.log(`File ${specFile.getFilePath()} successfully validated!`);
      } else if (specFile.getFileURL()) {
        await parser.parse(specFile.text());
        this.log(`URL ${specFile.getFileURL()} successfully validated!`);
      }

      // CONVERSION
      convertedFile = await convert(specFile.text(), Convert.flags['target-version'], Convert.flags.id);
      if (convertedFile.getFilePath()) {
        this.log(`File ${convertedFile.getFilePath()} successfully converted!`);
      } else if (convertedFile.getFileURL()) {
        this.log(`URL ${convertedFile.getFileURL()} successfully converted!`);
      }
    } catch (err) {
      if (err instanceof SpecificationFileNotFound) {
        this.error(new ValidationError({
          type: 'invalid-file',
          filepath: filePath
        }));
      } else {
        this.error(err as Error);
      }
    }
  }
}
