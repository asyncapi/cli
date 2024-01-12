import { Flags } from '@oclif/core';
import Command from '../base';
import { validate, validationFlags } from '../parser';
import { load } from '../models/SpecificationFile';
import { specWatcher } from '../globals';
import { watchFlag } from '../flags';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag(),
    ...validationFlags(),
  };

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ];

  async run() {
    const { args, flags } = await this.parse(Validate); //NOSONAR
    const filePath = args['spec-file'];
    const watchMode = flags.watch;

    this.specFile = await load(filePath);
    if (watchMode) {
      specWatcher({ spec: this.specFile, handler: this, handlerName: 'validate' });
    }

    const result = await validate(this, this.specFile, flags);

    this.metricsMetadata.validation_result = result;
  }
}
