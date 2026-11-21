import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { loadContextFile, removeContext, CONTEXT_FILE_PATH } from '@models/Context';
import {
  MissingContextFileError,
  ContextFileEmptyError,
} from '@errors/context-error';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { blueBright } from 'picocolors';
import { resolve } from 'node:path';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

export default class ContextRemove extends Command {
  static readonly description = 'Delete a context from the store';
  static readonly flags = helpFlag();

  static readonly args = {
    'context-name': Args.string({
      description: 'Name of the context to delete',
      required: true,
    }),
  };

  async run() {
    const { args } = await this.parse(ContextRemove);
    const contextName = args['context-name'];

    try {
      const fileContent = await loadContextFile();
      const removedPath = fileContent.store[contextName];
      const wasCurrent = fileContent.current === contextName;
      await removeContext(contextName);
      this.log(`Context ${blueBright(contextName)} removed successfully!\n`);
      return this.result('Context removed successfully.', {
        name: contextName,
        path: resolve(removedPath as string),
        wasCurrent,
        contextFile: CONTEXT_FILE_PATH,
        warnings: [],
      });
    } catch (e) {
      if (e instanceof MissingContextFileError) {
        throw new ApplicationError(
          CLI_ERROR_CODES.CONTEXT_FILE_NOT_FOUND,
          `Unable to remove context. You have no context file configured.\nRun ${blueBright('asyncapi config context init')} to initialize it.`,
          { cause: e },
        );
      } else if (e instanceof ContextFileEmptyError) {
        throw new ApplicationError(
          CLI_ERROR_CODES.CONTEXT_FILE_EMPTY,
          `Context file ${blueBright(CONTEXT_FILE_PATH)} is empty.`,
          { cause: e },
        );
      }
      throw e;
    }
  }
}
