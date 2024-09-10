import { Args } from '@oclif/core';
import Command from '../../../core/base';
import { addContext, setCurrentContext } from '../../../core/models/Context';
import {
  MissingContextFileError,
  ContextFileWrongFormatError,
} from '../../../core/errors/context-error';
import { addFlags } from '../../../core/flags/config/context.flags';
import { cyan } from 'picocolors';

export default class ContextAdd extends Command {
  static description = 'Add a context to the store';
  static flags = addFlags();

  static args = {
    'context-name': Args.string({ description: 'context name', required: true }),
    'spec-file-path': Args.string({ description: 'file path of the spec file', required: true }),
  };

  async run() {
    const { args, flags } = await this.parse(ContextAdd);
    const contextName = args['context-name'];
    const specFilePath = args['spec-file-path'];
    const setAsCurrent = flags['set-current'];

    try {
      await addContext(contextName, specFilePath);
      this.log(`🎉 Context ${cyan(contextName)} added successfully!`);
      this.log(`\nYou can set it as your current context:\n  ${cyan('asyncapi')} ${cyan('config')} ${cyan('context')} ${cyan('use')} ${cyan(contextName)}`);
      this.log(`\nYou can use this context when needed by passing ${cyan(contextName)} as a parameter:\n  ${cyan('asyncapi')} ${cyan('validate')} ${cyan(contextName)}`);

      if (setAsCurrent) {
        await setCurrentContext(contextName);
        this.log(`\nThe newly added context, ${cyan(contextName)}, is set as your current context!`);
      }
    } catch (e) {
      if (
        e instanceof (MissingContextFileError || ContextFileWrongFormatError)
      ) {
        this.error(`Unable to add context. You have no context file configured.\nRun ${cyan('asyncapi config context init')} to initialize it.`);
      }
      throw e;
    }
  }
}
