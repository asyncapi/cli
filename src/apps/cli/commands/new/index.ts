import Command from '@cli/internal/base';
import { Help } from '@oclif/core';

export default class New extends Command {
  static readonly description =
    'Create a new AsyncAPI project, specification files, or templates for clients and applications.';
  async run() {
    await this.parse(New);
    const help = new Help(this.config);
    if (!this.jsonEnabled()) {
      help.showHelp(['new', '--help']);
    }
    return this.result('New command help retrieved.', {
      topic: 'new',
      help: New.description,
      warnings: [],
    });
  }
}
