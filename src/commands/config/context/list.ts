import {Flags} from '@oclif/core';
import Command from '../../../base';
import { loadContextFile } from '../../../models/Context';

export default class ContextList extends Command {
  static description = 'List all the stored context in the store';
  static flags = {
    help: Flags.help({char: 'h'})
  }

  async run() {
    const fileContent = await loadContextFile();
    for (const [contextName, filePath] of Object.entries(fileContent.store)) {
      this.log(`${contextName}: ${filePath}`);
    }
  }
}
