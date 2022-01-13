import { flags } from '@oclif/command';
import * as parser from '@asyncapi/parser';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';
import { SpecificationFileNotFound } from '../errors/specification-file';

export default class Convert extends Command {
  static description = 'convert asyncapi documents older to newer versions';

  static flags = {
    help: flags.help({ char: 'h' }),
    'file-name': flags.string({ char: 'f', description: 'name of the file to convert' }),
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

    /*     
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
    } */
    
    // Conversion
    try {
      

    } catch (error) {
      
      };
    }

  }