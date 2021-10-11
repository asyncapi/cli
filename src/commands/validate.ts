import { Command, flags } from '@oclif/command';
import { container } from 'tsyringe';
import { ValidationService } from '../validation';
import { SpecificationFile } from '../models';

const validationService = container.resolve(ValidationService);

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
    const specFile = new SpecificationFile(args['spec-file']);
    const message = await validationService.validate(specFile);
    this.log(message);
  }

  async catch(e: Error) {
    console.error(`${e.name}: ${e.message}`);
  }
}
