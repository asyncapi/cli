import Command from '../../core/base';
import { Help } from '@oclif/core';

export default class New extends Command {
  static readonly description = 'Create a new AsyncAPI project, specification files, or templates for clients and applications.';
  async run() {
    const help = new Help(this.config);
    help.showHelp(['new', '--help']);
  }
}
