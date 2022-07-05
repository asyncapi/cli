import { Flags } from '@oclif/core';
import * as parser from '@asyncapi/parser';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';
import { specWatcher } from '../globals';
import { watchFlag } from '../flags';
import { SpecificationFileNotFound } from '../errors/specification-file';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag
  }

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ]

  async run() {
    const { args, flags } = await this.parse(Validate); //NOSONAR
    const filePath = args['spec-file'];

    const watchMode = flags['watch'];

    const specFile = await load(filePath);
    if (watchMode) {
      specWatcher({spec: specFile, handler: this, handlerName: 'validate'});
    }
    try {
      const specFile = await load(filePath);
      if (watchMode) {
        specWatcher({ spec: specFile, handler: this, handlerName: 'validate' });
      }

      if (specFile.getFilePath()) {
        await parser.parse(specFile.text());
        this.log(`File ${specFile.getFilePath()} successfully validated!`);
      } else if (specFile.getFileURL()) {
        await parser.parse(specFile.text());
        this.log(`URL ${specFile.getFileURL()} successfully validated`);
      }
    } catch (e) {
      if (e instanceof SpecificationFileNotFound) {
        this.error(new ValidationError({
          type: 'invalid-file',
          filepath: filePath
        }));
      } else {
        throw new ValidationError({
          type: 'parser-error',
          err: e
        });
      }
    }
  }
}
