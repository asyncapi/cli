import { flags } from '@oclif/command';
import * as parser from '@asyncapi/parser';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';
import { SpecificationFileNotFound } from '../errors/specification-file';
import { specWatcher } from '../globals';
import { watchFlag } from '../flags';


export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    help: flags.help({ char: 'h' }),
    watch: watchFlag
  }

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ]

  async run() {
    const { args, flags } = this.parse(Validate); // NOSONAR
    const filePath = args['spec-file'];

    const watchMode = flags['watch'];
    
    let specFile;

    const specFile = await load(filePath);

    try {
      if (specFile.getFilePath()) {
        if (watchMode) {specWatcher(specFile.getFilePath() as string,this,'validate');}
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
