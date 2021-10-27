import { flags} from '@oclif/command';
import Command from '../../base';

export default class ConfigContext extends Command {
  static flags = {
    help: flags.help({char: 'h'})
  }

  async run() {
    await this._help();
  }
}
