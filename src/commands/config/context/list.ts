import {Command, flags} from '@oclif/command';
import {container} from 'tsyringe';
import {ContextService} from '../../../config/context';
import { MissingContextFileError } from '../../../errors/context-error';

const contextService = container.resolve(ContextService);

export default class ContextList extends Command {
  static description = 'List all the stored context in the store';
  static flags = {
    help: flags.help({char: 'h'})
  }

  async run() {
    const context = contextService.context;
    if (!context) {throw new MissingContextFileError();}
    for (const [contextname, contextPath] of Object.entries(context?.store)) {
      console.log(`${contextname}: ${contextPath}`);
    }
  }

  async catch(e: Error) {
    console.error(`${e.name}: ${e.message}`);
  }
}
