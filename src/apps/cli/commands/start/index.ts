import Command from '@cli/internal/base';
import { Help } from '@oclif/core';

export default class Start extends Command {
  static description =
    'Starts AsyncAPI-related services. Currently, it supports launching the AsyncAPI Studio';
  async run() {
    await this.parse(Start);
    const help = new Help(this.config);
    if (!this.jsonEnabled()) {
      help.showHelp(['start', '--help']);
    }
    return this.result('Start command help retrieved.', {
      topic: 'start',
      help: Start.description,
      warnings: [],
    });
  }
}
