import {Command, flags} from '@oclif/command';

export default class ConfigContext extends Command {
  static flags = {
    help: flags.help({char: 'h'})
  }

  async run() {
    await this._help();
  }
}
