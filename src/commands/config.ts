import { Flags } from '@oclif/core';
import Command from '../base';

export class Config extends Command {
  static description = 'access configs'
  static flags = {
    help: Flags.help({ char: 'h' })
  }

  async run() {
  }
}
