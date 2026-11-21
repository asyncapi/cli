import Command from '@cli/internal/base';
import { loadHelpClass } from '@oclif/core';

export default class Config extends Command {
  static description = 'CLI config settings';
  async run() {
    await this.parse(Config);
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config);
    if (!this.jsonEnabled()) {
      help.showHelp(['config', '--help']);
    }
    return this.result('Config command help retrieved.', {
      topic: 'config',
      help: Config.description,
      warnings: [],
    });
  }
}
