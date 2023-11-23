import { Flags } from '@oclif/core';

import Command from '../base';
import { validate, validationFlags } from '../parser';
import { load } from '../models/SpecificationFile';
import { specWatcher } from '../globals';
import { watchFlag } from '../flags';
import { MetadataFromDocument } from '@smoya/asyncapi-adoption-metrics';
import { Parser } from '@asyncapi/parser';

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

  parser = new Parser();

  async run() {
    const { args, flags } = await this.parse(Validate); //NOSONAR
    const filePath = args['spec-file'];
    const watchMode = flags.watch;

    const specFile = await load(filePath);
    if (watchMode) {
      specWatcher({ spec: specFile, handler: this, handlerName: 'validate' });
    }

    const result = await validate(this, specFile, flags);

    try {
      // Metrics recording.
      const {document} = await this.parser.parse(specFile.text());
      if (document !== undefined) {
        const metadata = MetadataFromDocument(document);
        metadata['success'] = true;
        metadata['validation_result'] = result;
        await this.recorder.recordActionExecuted('validate', metadata);
        await this.recorder.flush();
      }
    } catch (e: any) {
      if (e instanceof Error) {
        this.log(`Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`);
      }
    }
  }
}
