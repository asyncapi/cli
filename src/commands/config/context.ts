import {Flags} from '@oclif/core';
import Command from '../../base';

export default class ConfigContext extends Command {
  static flags = {
    help: Flags.help({char: 'h'})
  }

  async run() {
  }
}
