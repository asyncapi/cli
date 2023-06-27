import { Flags } from '@oclif/core';
import Command from '../../../base';
import { loadContextFile, CONTEXT_FILE_PATH } from '../../../models/Context';

export default class ContextList extends Command {
  static description = 'List all the stored contexts in the store';
  static flags = {
    help: Flags.help({ char: 'h' }),
  };

  async run() {
    const fileContent = await loadContextFile();
    // If context file contains only one empty property `store` then the whole
    // context file is considered empty.
    if (
      Object.keys(fileContent).length === 1 &&
      Object.keys(fileContent.store).length === 0
    ) {
      this.log(`Context file "${CONTEXT_FILE_PATH}" is empty.`);
      return;
    }
    for (const [contextName, filePath] of Object.entries(fileContent.store)) {
      this.log(`${contextName}: ${filePath}`);
    }
  }
}
