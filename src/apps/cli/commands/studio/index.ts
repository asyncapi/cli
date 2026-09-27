import Command from '@cli/internal/base';
import { loadHelpClass } from '@oclif/core';

export default class Studio extends Command {
  static readonly description = 'Manage the optional AsyncAPI Studio installation';

  async run() {
    await this.parse(Studio);
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config);
    if (!this.jsonEnabled()) {
      help.showHelp(['studio', '--help']);
    }
    return this.result('Studio command help retrieved.', {
      topic: 'studio',
      help: Studio.description,
      warnings: [],
    });
  }
}
