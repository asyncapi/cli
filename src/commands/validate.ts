import {flags } from '@oclif/command';
import * as parser from '@asyncapi/parser';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';
import { SpecificationFileNotFound } from '../errors/specification-file';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    help: flags.help({ char: 'h' })
  }

  static args = [
    { name: 'spec-file', description: 'spec path or context-name', required: false },
  ]

  async run() {
    const { args } = this.parse(Validate);
    const filePath = args['spec-file'];
    let specFile;
    
    try {
      specFile = await load(filePath);
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
    try {
      await parser.parse(await specFile.read());
      this.log(`File ${specFile.getPath()} successfully validated!`);
    } catch (error) {
      throw new ValidationError({
        type: 'parser-error',
        err: error
      });
    }
  }
}
