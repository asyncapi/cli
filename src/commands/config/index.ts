import Command from '../../base';
import {loadHelpClass} from '@oclif/core';

export default class Config extends Command {
  async run() {
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config);
    help.showHelp(['config', '--help']);
  }
}
