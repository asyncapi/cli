import Command from '@cli/internal/base';
import { loadHelpClass } from '@oclif/core';

export default class Studio extends Command {
  static readonly description = 'Manage the optional AsyncAPI Studio installation';

  async run() {
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config);
    help.showHelp(['studio', '--help']);
  }
}
