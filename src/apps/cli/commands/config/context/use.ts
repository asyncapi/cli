import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { loadContextFile, setCurrentContext, CONTEXT_FILE_PATH } from '@models/Context';
import {
  MissingContextFileError,
  ContextFileEmptyError,
} from '@errors/context-error';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { blueBright } from 'picocolors';
import { resolve } from 'path';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

export default class ContextUse extends Command {
  static description = 'Set a context as current';
  static flags = helpFlag();

  static args = {
    'context-name': Args.string({
      description: 'name of the saved context',
      required: true,
    }),
  };

  async run() {
    const { args } = await this.parse(ContextUse);
    const contextName = args['context-name'];

    try {
      const fileContent = await loadContextFile();
      await setCurrentContext(contextName);
      this.log(`Context ${blueBright(contextName)} is now set as current.`);
      return this.result('Current context updated.', {
        name: contextName,
        path: resolve(fileContent.store[contextName] as string),
        contextFile: CONTEXT_FILE_PATH,
        warnings: [],
      });
    } catch (e) {
      if (e instanceof MissingContextFileError) {
        throw new ApplicationError(
          CLI_ERROR_CODES.CONTEXT_FILE_NOT_FOUND,
          `Unable to set the current context. You have no context file configured.\nRun ${blueBright('asyncapi config context init')} to initialize it.`,
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
