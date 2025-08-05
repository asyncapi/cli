import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { setCurrentContext, CONTEXT_FILE_PATH } from '@models/Context';
import {
  MissingContextFileError,
  ContextFileWrongFormatError,
  ContextFileEmptyError,
} from '@errors/context-error';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { blueBright } from 'picocolors';

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
      await setCurrentContext(contextName);
      this.log(`Context ${blueBright(contextName)} is now set as current.`);
    } catch (e) {
      if (
        e instanceof (MissingContextFileError || ContextFileWrongFormatError)
      ) {
        this.error(
          `Unable to set the current context. You have no context file configured.\nRun ${blueBright('asyncapi config context init')} to initialize it.`,
        );
      } else if (e instanceof ContextFileEmptyError) {
        this.error(`Context file ${blueBright(CONTEXT_FILE_PATH)} is empty.`);
        return;
      }
      throw e;
    }
  }
}
