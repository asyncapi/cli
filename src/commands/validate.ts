import { Args } from '@oclif/core';
import Command from '../core/base';
import { validate, ValidateOptions, ValidationStatus } from '../core/parser';
import { load } from '../core/models/SpecificationFile';
import { specWatcher } from '../core/globals';
import { validateFlags } from '../core/flags/validate.flags';
import { calculateScore } from 'core/utils/scoreCalculator';
import { parse } from 'core/parser';
export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = validateFlags();

  static args = {
    'spec-file': Args.string({description: 'spec path, url, or context-name', required: false}),
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
