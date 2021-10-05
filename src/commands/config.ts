import {Command, flags} from '@oclif/command';

export class Config extends Command {
  static description = 'access configs'
  static flags = {
    help: flags.help({char: 'h'})
  }

  async run() {
    await this._help();
  }
}
