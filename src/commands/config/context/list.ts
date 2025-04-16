import Command from '../../../core/base';
import {
  loadContextFile,
  isContextFileEmpty,
  CONTEXT_FILE_PATH,
} from '../../../core/models/Context';
import {
  MissingContextFileError,
  ContextFileWrongFormatError,
} from '../../../core/errors/context-error';
import { helpFlag } from '../../../core/flags/global.flags';
import { blueBright } from 'picocolors';

export default class ContextList extends Command {
  static description = 'List all the stored contexts in the store';
  static flags = helpFlag();

  async run() {
    try {
      const fileContent = await loadContextFile();

      if (await isContextFileEmpty(fileContent)) {
        this.log(`Context file ${blueBright(CONTEXT_FILE_PATH)} is empty.`);
        return;
      }

      if (fileContent) {
        for (const [contextName, filePath] of Object.entries(
          fileContent.store
        )) {
          this.log(`${blueBright(contextName)}: ${filePath}`);
        }
      }
    } catch (e) {
      if (
        e instanceof (MissingContextFileError || ContextFileWrongFormatError)
      ) {
        this.log(`Unable to list contexts. You have no context file configured.\nRun ${blueBright('asyncapi config context init')} to initialize it.\n`);
        return;
      }
      throw e;
    }
  }
}
