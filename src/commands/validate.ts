import {Command, flags} from '@oclif/command';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    help: flags.help({char: 'h'})
  }

  static args = [
    {name: 'spec-file', description: 'spec path or context-name', required: true},
  ]

  async run() {
    await this.log('Validating...');
  }

  async catch(e: Error) {
    await this.error(e.message);
  }
}
