import { loadHelpClass } from '@oclif/core';
import Command from '@cli/internal/base';

export default class Context extends Command {
  static description =
    'Manage short aliases for full paths to AsyncAPI documents';

  async run() {
    await this.parse(Context);
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config);
    if (!this.jsonEnabled()) {
      await help.showHelp(['config', 'context', '--help']);
    }
    return this.result('Context command help retrieved.', {
      topic: 'config context',
      help: Context.description,
      warnings: [],
    });
  }
}
