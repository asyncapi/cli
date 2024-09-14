import { Args } from '@oclif/core';
import Command from '../../../core/base';
import { removeContext, CONTEXT_FILE_PATH } from '../../../core/models/Context';
import {
  MissingContextFileError,
  ContextFileWrongFormatError,
  ContextFileEmptyError,
} from '../../../core/errors/context-error';
import { helpFlag } from '../../../core/flags/global.flags';

export default class ContextRemove extends Command {
  static description = 'Delete a context from the store';
  static flags = helpFlag();

  static args = {
    'context-name': Args.string({description: 'Name of the context to delete', required: true}),
  };

  async run() {
    const { args } = await this.parse(ContextRemove);
    const contextName = args['context-name'];

    try {
      await removeContext(contextName);
      this.log(`${contextName} successfully deleted`);
    } catch (e) {
      if (
        e instanceof (MissingContextFileError || ContextFileWrongFormatError)
      ) {
        this.log(
          'You have no context file configured. Run "asyncapi config context init" to initialize it.'
        );
        return;
      } else if (e instanceof ContextFileEmptyError) {
        this.log(`Context file "${CONTEXT_FILE_PATH}" is empty.`);
        return;
      }
      throw e;
    }
  }
}
