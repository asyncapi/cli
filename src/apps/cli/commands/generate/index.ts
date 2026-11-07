import Command from '@cli/internal/base';
import { Help } from '@oclif/core';

export default class Generate extends Command {
  static description =
    'Generate typed models or other things like clients, applications or docs using AsyncAPI Generator templates.';
  async run() {
    await this.parse(Generate);
    const help = new Help(this.config);
    if (!this.jsonEnabled()) {
      help.showHelp(['generate', '--help']);
    }
    return this.result('Generate command help retrieved.', {
      topic: 'generate',
      help: Generate.description,
      warnings: [],
    });
  }
}
