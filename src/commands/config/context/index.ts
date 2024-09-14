import { loadHelpClass } from '@oclif/core';
import Command from '../../../core/base';

export default class Context extends Command {
  static description =
    'Manage short aliases for full paths to AsyncAPI documents';

  async run() {
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config);
    help.showHelp(['config', 'context', '--help']);
  }
}
