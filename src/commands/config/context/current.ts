import { Flags } from '@oclif/core';
import Command from '../../../base';
import { getCurrentContext } from '../../../models/Context';
import {
  MissingContextFileError,
  ContextFileWrongFormatError,
  ContextNotFoundError,
} from '../../../errors/context-error';

export default class ContextCurrent extends Command {
  static description = 'Shows the current context that is being used';
  static flags = {
    help: Flags.help({ char: 'h' }),
  };

  async run() {
    let fileContent;

    try {
      fileContent = await getCurrentContext();
    } catch (e) {
      if (
        e instanceof MissingContextFileError ||
        ContextFileWrongFormatError ||
        ContextNotFoundError ||
        (fileContent && !fileContent.current) ||
        !fileContent
      ) {
        this.log(
          'No context is set as current. Run "asyncapi config context" to see all available options.'
        );
        return;
      } else {
        throw e;
      }
    }

    if (fileContent) {
      this.log(`${fileContent.current}: ${fileContent.context}`);
    }
  }
}
