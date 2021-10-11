import { Command, flags } from '@oclif/command';
import { ContextService } from '../../../config/context';
import { container } from 'tsyringe';
import {
  MissingContextFileError,
  MissingCurrentContextError
} from '../../../errors/context-error';

const contextService = container.resolve(ContextService);

export default class ContextCurrent extends Command {
  static description='Shows the current context that is being used';
  static flags={
    help: flags.help({char: 'h'})
  }

  async run() {
    const context = contextService.context;
    if (!context) { throw new MissingContextFileError(); }
    if (!context.current) {throw new MissingCurrentContextError();}
    console.log(`${context.current} : ${context.store[context.current as string]}`);
  }
}
