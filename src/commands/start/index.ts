import Command from '../../core/base';
import { Help } from '@oclif/core';

export default class Start extends Command {
  static description = '';
  async run() {
    const help = new Help(this.config);
    help.showHelp(['start', '--help']);
  }
}
