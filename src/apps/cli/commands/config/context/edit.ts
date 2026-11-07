import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { editContext, loadContextFile, CONTEXT_FILE_PATH } from '@models/Context';
import {
  MissingContextFileError,
  ContextFileEmptyError,
} from '@errors/context-error';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { blueBright } from 'picocolors';
import { resolve } from 'node:path';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

export default class ContextEdit extends Command {
  static readonly description = 'Edit a context in the store';
  static readonly flags = helpFlag();

  static readonly args = {
    'context-name': Args.string({
      description: 'context name',
      required: true,
    }),
    'new-spec-file-path': Args.string({
      description: 'file path of the spec file',
      required: true,
    }),
  };
  async run() {
    const { args } = await this.parse(ContextEdit);
    const contextName = args['context-name'];
    const newSpecFilePath = args['new-spec-file-path'];

    try {
      const fileContent = await loadContextFile();
      const previousPath = fileContent.store[contextName] || null;
      await editContext(contextName, newSpecFilePath);
      this.log(
        `🎉 Context ${blueBright(contextName)} edited successfully!\nYou can set it as your current context:\n  ${blueBright('asyncapi')} ${blueBright('config')} ${blueBright('context')} ${blueBright('use')} ${blueBright(contextName)}\nYou can use this context when needed by passing ${blueBright(contextName)} as a parameter:\n  ${blueBright('asyncapi')} ${blueBright('validate')} ${blueBright(contextName)}`,
      );
      return this.result('Context edited successfully.', {
        name: contextName,
        previousPath: previousPath ? resolve(previousPath) : null,
        path: resolve(newSpecFilePath),
        contextFile: CONTEXT_FILE_PATH,
        warnings: [],
      });
    } catch (e) {
      if (e instanceof MissingContextFileError) {
        throw new ApplicationError(
          CLI_ERROR_CODES.CONTEXT_FILE_NOT_FOUND,
          `Unable to edit context. You have no context file configured.\nRun ${blueBright('asyncapi config context init')} to initialize it.`,
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
