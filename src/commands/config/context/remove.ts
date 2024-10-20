import { Args } from '@oclif/core';
import Command from '../../../core/base';
import { removeContext, CONTEXT_FILE_PATH } from '../../../core/models/Context';
import {
  MissingContextFileError,
  ContextFileWrongFormatError,
  ContextFileEmptyError,
} from '../../../core/errors/context-error';
import { helpFlag } from '../../../core/flags/global.flags';
import { cyan } from 'picocolors';

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
      this.log(`Context ${cyan(contextName)} removed successfully!`);
    } catch (e) {
      if (
        e instanceof (MissingContextFileError || ContextFileWrongFormatError)
      ) {
        this.error(`Unable to remove context. You have no context file configured.\nRun ${cyan('asyncapi config context init')} to initialize it.`);
      } else if (e instanceof ContextFileEmptyError) {
        this.error(`Context file ${cyan(CONTEXT_FILE_PATH)} is empty.`);
      }
      throw e;
    }
  }
}
