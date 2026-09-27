import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { addContext, setCurrentContext } from '@models/Context';
import { MissingContextFileError } from '@errors/context-error';
import { addFlags } from '@cli/internal/flags/config/context.flags';
import { blueBright } from 'picocolors';
import { CONTEXT_FILE_PATH } from '@models/Context';
import { resolve } from 'path';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

export default class ContextAdd extends Command {
  static description = 'Add a context to the store';
  static flags = addFlags();

  static args = {
    'context-name': Args.string({
      description: 'context name',
      required: true,
    }),
    'spec-file-path': Args.string({
      description: 'file path of the spec file',
      required: true,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(ContextAdd);
    const contextName = args['context-name'];
    const specFilePath = args['spec-file-path'];
    const setAsCurrent = flags['set-current'];

    try {
      await addContext(contextName, specFilePath);
      this.log(
        `🎉 Context ${blueBright(contextName)} added successfully!\nYou can set it as your current context:\n  ${blueBright('asyncapi')} ${blueBright('config')} ${blueBright('context')} ${blueBright('use')} ${blueBright(contextName)}\nYou can use this context when needed by passing ${blueBright(contextName)} as a parameter:\n  ${blueBright('asyncapi')} ${blueBright('validate')} ${blueBright(contextName)}`,
      );
      if (setAsCurrent) {
        await setCurrentContext(contextName);
        this.log(
          `\nThe newly added context, ${blueBright(contextName)}, is set as your current context!`,
        );
      }
      return this.result('Context added successfully.', {
        name: contextName,
        path: resolve(specFilePath),
        current: setAsCurrent,
        contextFile: CONTEXT_FILE_PATH,
        warnings: [],
      });
    } catch (e) {
      if (e instanceof MissingContextFileError) {
        throw new ApplicationError(
          CLI_ERROR_CODES.CONTEXT_FILE_NOT_FOUND,
          `Unable to add context. You have no context file configured.\nRun ${blueBright('asyncapi config context init')} to initialize it.`,
          { cause: e },
        );
      }
      throw e;
    }
  }
}
