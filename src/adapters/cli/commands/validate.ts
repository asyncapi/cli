import Command from '../core/base';
import { validate } from '../core/parser';
import { load } from '../core/models/SpecificationFile';
import { specWatcher } from '../core/globals';
import { validateFlags } from '../core/flags/validate.flags';
export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = validateFlags();

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ];

  async run() {
    const { args, flags } = await this.parse(Validate); //NOSONAR
    const filePath = args['spec-file'];
    const watchMode = flags.watch;

    const specFile = await load(filePath);
    if (watchMode) {
      specWatcher({ spec: specFile, handler: this, handlerName: 'validate' });
    }

    const validationResult = await validate(this, specFile, flags);
    if (validationResult === 'invalid') {
      process.exitCode = 1;
    }
  }
}
