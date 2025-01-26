import Command from '../../../core/base';
import { getCurrentContext, CONTEXT_FILE_PATH } from '../../../core/models/Context';
import {
  MissingContextFileError,
  ContextFileWrongFormatError,
  ContextFileEmptyError,
  ContextNotFoundError,
} from '../../../core/errors/context-error';
import { helpFlag } from '../../../core/flags/global.flags';
import { blueBright } from 'picocolors';

export default class ContextCurrent extends Command {
  static description = 'Shows the current context that is being used';
  static flags = helpFlag();

  async run() {
    let fileContent;

    try {
      fileContent = await getCurrentContext();
    } catch (e) {
      if (
        e instanceof (MissingContextFileError || ContextFileWrongFormatError)
      ) {
        this.error(`Unable to show current context. You have no context file configured.\nRun ${blueBright('asyncapi config context init')} to initialize it.`);
      } else if (e instanceof ContextFileEmptyError) {
        this.error(`Context file ${blueBright(CONTEXT_FILE_PATH)} is empty.`);
      } else if (
        e instanceof ContextNotFoundError ||
        (fileContent && !fileContent.current)
      ) {
        this.error(`No context is set as current.\nRun ${blueBright('asyncapi config context')} to see all available options.`);
      }
      throw e;
    }

    if (fileContent) {
      this.log(`${blueBright(fileContent.current)}: ${fileContent.context}`);
    }
  }
}
