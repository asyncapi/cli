import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { editContext, CONTEXT_FILE_PATH } from '@models/Context';
import {
  MissingContextFileError,
  ContextFileWrongFormatError,
  ContextFileEmptyError,
} from '@errors/context-error';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { blueBright } from 'picocolors';

export default class ContextEdit extends Command {
  static description = 'Edit a context in the store';
  static flags = helpFlag();

  static args = {
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
      await editContext(contextName, newSpecFilePath);
      this.log(
        `🎉 Context ${blueBright(contextName)} edited successfully!\nYou can set it as your current context:\n  ${blueBright('asyncapi')} ${blueBright('config')} ${blueBright('context')} ${blueBright('use')} ${blueBright(contextName)}\nYou can use this context when needed by passing ${blueBright(contextName)} as a parameter:\n  ${blueBright('asyncapi')} ${blueBright('validate')} ${blueBright(contextName)}`,
      );
    } catch (e) {
      if (
        e instanceof (MissingContextFileError || ContextFileWrongFormatError)
      ) {
        this.error(
          `Unable to edit context. You have no context file configured.\nRun ${blueBright('asyncapi config context init')} to initialize it.`,
        );
      } else if (e instanceof ContextFileEmptyError) {
        this.error(`Context file ${blueBright(CONTEXT_FILE_PATH)} is empty.`);
      }
      throw e;
    }
  }
}
