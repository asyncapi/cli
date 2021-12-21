import { flags } from '@oclif/command';
import Command from '../base';

export class Start extends Command {
  static description = 'starts a new local instance of Studio';

  static flags = {
    help: flags.help({ char: 'h' })
  }

  async run() {
    this._help();
  }
}
