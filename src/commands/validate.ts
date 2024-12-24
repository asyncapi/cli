import { Args } from '@oclif/core';
import Command from '../core/base';
import { validate, ValidateOptions, ValidationStatus, parse } from '../core/parser';
import { load } from '../core/models/SpecificationFile';
import { specWatcher } from '../core/globals';
import { validateFlags } from '../core/flags/validate.flags';
import { proxyFlags } from '../core/flags/proxy.flags';
import { calculateScore } from '../core/utils/scoreCalculator';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    ...validateFlags(),
    ...proxyFlags(), // Merge proxyFlags with validateFlags
  };

  static args = {
    'spec-file': Args.string({description: 'spec path, url, or context-name', required: false}),
    proxyHost: Args.string({description: 'Name of the Proxy Host', required: false}),
    proxyPort: Args.string({description: 'Name of the Port of the ProxyHost', required: false}),
  };

  async run() {
    const { args, flags } = await this.parse(Validate); //NOSONAR
    let filePath = args['spec-file'];
    const proxyHost = flags['proxyHost'];
    const proxyPort = flags['proxyPort'];
    if (proxyHost && proxyPort) {
      const proxyUrl = `http://${proxyHost}:${proxyPort}`;
      filePath = `${filePath}+${proxyUrl}`; // Update filePath with proxyUrl
    }
    this.specFile = await load(filePath);
    const watchMode = flags.watch;
    if (flags['score']) {
      const { document } = await parse(this,this.specFile);
      this.log(`The score of the asyncapi document is ${await calculateScore(document)}`);
    }

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
