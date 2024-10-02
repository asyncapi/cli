import Command from '../../core/base';
import { Help } from '@oclif/core';

export default class Start extends Command {
  static description = 'Starts AsyncAPI-related services. Currently, it supports launching the AsyncAPI Studio';
  async run() {
    const help = new Help(this.config);
    help.showHelp(['start', '--help']);
  }
}
