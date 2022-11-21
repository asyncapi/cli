import Command from '../../base';
import { Help } from '@oclif/core';

export default class Start extends Command {
  static description = 'Start asyncapi studio';
  async run() {
    const help = new Help(this.config);
    help.showHelp(['start', '--help']);
  }
}
