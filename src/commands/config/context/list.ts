import { Flags } from '@oclif/core';
import Command from '../../../base';
import { loadContextFile, CONTEXT_FILE_PATH } from '../../../models/Context';
import {
  MissingContextFileError,
  ContextFileWrongFormatError,
} from '../../../errors/context-error';

export default class ContextList extends Command {
  static description = 'List all the stored contexts in the store';
  static flags = {
    help: Flags.help({ char: 'h' }),
  };

  async run() {
    let fileContent;

    try {
      fileContent = await loadContextFile();
    } catch (e) {
      if (e instanceof MissingContextFileError || ContextFileWrongFormatError) {
        this.log(
          'You have no context configured. Run "asyncapi config context" to see all available options.'
        );
      }
    }

    // If context file contains only one empty property `store` then the whole
    // context file is considered empty.
    if (
      fileContent &&
      Object.keys(fileContent).length === 1 &&
      Object.keys(fileContent.store).length === 0
    ) {
      this.log(`Context file "${CONTEXT_FILE_PATH}" is empty.`);
      return;
    }

    if (fileContent) {
      for (const [contextName, filePath] of Object.entries(fileContent.store)) {
        this.log(`${contextName}: ${filePath}`);
      }
    }
  }
}
