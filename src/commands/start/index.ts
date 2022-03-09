import Command from '../../base';
import {loadHelpClass} from '@oclif/core';

export default class Start extends Command {
  async run() {
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config);
    help.showHelp(['start', '--help']);
  }
}
