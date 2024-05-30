import { Flags, Args } from '@oclif/core';
import Command from '../base';
import { calculateScore } from '../utils/scoreCalculator';
import { validate, validationFlags, ValidateOptions, ValidationStatus, parse } from '../parser';
import { load } from '../models/SpecificationFile';
import { specWatcher } from '../globals';
import { watchFlag } from '../flags';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag(),
    ...validationFlags(),
    score: Flags.boolean({
      description: 'Compute the score of the AsyncAPI document',
      required: false,
      default: false
    }),
  };

  static args = {
    'spec-file': Args.string({ description: 'spec path, url, or context-name', required: false }),
  };

  async run() {
    const { args, flags } = await this.parse(Validate); //NOSONAR

    const filePath = args['spec-file'];
    const watchMode = flags.watch;
    if (flags['score']) {
      this.specFile = await load(filePath);
      const { document } = await parse(this,this.specFile);
      this.log(`The score of the asyncapi document is ${await calculateScore(document)}`);
    }
    this.specFile = await load(filePath);
    if (watchMode) {
      specWatcher({ spec: this.specFile, handler: this, handlerName: 'validate' });
    }

    const result = await validate(this, this.specFile, flags as ValidateOptions);
    this.metricsMetadata.validation_result = result;

    if (result === ValidationStatus.INVALID) {
      process.exitCode = 1;
    }
  }
}
