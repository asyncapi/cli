import { Flags } from '@oclif/core';
import Command from '../base';

export class Start extends Command {
  static description = 'starts a new local instance of Studio';

  static flags = {
    help: Flags.help({ char: 'h' })
  }

  async run() {
  }
}
