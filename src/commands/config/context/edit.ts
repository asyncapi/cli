import { Args } from '@oclif/core';
import Command from '../../../core/base';
import { editContext, CONTEXT_FILE_PATH } from '../../../core/models/Context';
import {
  MissingContextFileError,
  ContextFileWrongFormatError,
  ContextFileEmptyError,
} from '../../../core/errors/context-error';
import { helpFlag } from '../../../core/flags/global.flags';
import { cyan } from 'picocolors';

export default class ContextEdit extends Command {
  static description = 'Edit a context in the store';
  static flags = helpFlag();

  static args = {
    'context-name': Args.string({ description: 'context name', required: true }),
    'new-spec-file-path': Args.string({ description: 'file path of the spec file', required: true }),
  };
  async run() {
    const { args } = await this.parse(ContextEdit);
    const contextName = args['context-name'];
    const newSpecFilePath = args['new-spec-file-path'];

    try {
      await editContext(contextName, newSpecFilePath);
      this.log(`🎉 Context ${cyan(contextName)} edited successfully!`);
      this.log(`\nYou can set it as your current context:\n  ${cyan('asyncapi')} ${cyan('config')} ${cyan('context')} ${cyan('use')} ${cyan(contextName)}`);
      this.log(`\nYou can use this context by passing ${cyan(contextName)} as a parameter:\n  ${cyan('asyncapi')} ${cyan('validate')} ${cyan(contextName)}`);
    } catch (e) {
      if (
        e instanceof (MissingContextFileError || ContextFileWrongFormatError)
      ) {
        this.error(`Unable to edit context. You have no context file configured.\nRun ${cyan('asyncapi config context init')} to initialize it.`);
      } else if (e instanceof ContextFileEmptyError) {
        this.error(`Context file ${cyan(CONTEXT_FILE_PATH)} is empty.`);
      }
      throw e;
    }
  }
}
