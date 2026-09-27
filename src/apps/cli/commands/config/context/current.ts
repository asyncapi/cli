import Command from '@cli/internal/base';
import { getCurrentContext, CONTEXT_FILE_PATH } from '@models/Context';
import {
  MissingContextFileError,
  ContextFileEmptyError,
  MissingCurrentContextError,
} from '@errors/context-error';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { blueBright } from 'picocolors';
import { resolve } from 'path';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

export default class ContextCurrent extends Command {
  static description = 'Shows the current context that is being used';
  static flags = helpFlag();

  async run() {
    await this.parse(ContextCurrent);
    let fileContent;

    try {
      fileContent = await getCurrentContext();
    } catch (e) {
      if (e instanceof MissingContextFileError) {
        throw new ApplicationError(
          CLI_ERROR_CODES.CONTEXT_FILE_NOT_FOUND,
          `Unable to show current context. You have no context file configured.\nRun ${blueBright('asyncapi config context init')} to initialize it.`,
          { cause: e },
        );
      } else if (e instanceof ContextFileEmptyError) {
        throw new ApplicationError(
          CLI_ERROR_CODES.CONTEXT_FILE_EMPTY,
          `Context file ${blueBright(CONTEXT_FILE_PATH)} is empty.`,
          { cause: e },
        );
      } else if (e instanceof MissingCurrentContextError) {
        throw new ApplicationError(
          CLI_ERROR_CODES.CURRENT_CONTEXT_NOT_SET,
          `No context is set as current.\nRun ${blueBright('asyncapi config context')} to see all available options.`,
          { cause: e },
        );
      }
      throw e;
    }

    if (fileContent) {
      this.log(`${blueBright(fileContent.current)}: ${fileContent.context}`);
      return this.result('Current context retrieved.', {
        context: {
          name: fileContent.current,
          path: resolve(fileContent.context),
        },
        contextFile: CONTEXT_FILE_PATH,
        warnings: [],
      });
    }
  }
}
