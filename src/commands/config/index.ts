import Command from '../../core/base';
import { loadHelpClass } from '@oclif/core';

export default class Config extends Command {
  static description = 'CLI config settings';
  async run() {
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config);
    help.showHelp(['config', '--help']);
  }
}
