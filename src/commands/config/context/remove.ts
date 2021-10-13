import { flags } from '@oclif/command';
import Command from '../../../base';
import { container } from 'tsyringe';
import { ContextService } from '../../../config/context';
import {
  ContextNotFound
} from '../../../errors/context-error';

const contextService = container.resolve(ContextService);

export default class ContextRemove extends Command {
  static description = 'Delete a context from the store';
  static flags = {
    help: flags.help({ char: 'h' })
  }
  static args = [
    { name: 'context-name', description: 'Name of the context to delete', required: true }
  ]
  async run() {
    const { args } = this.parse(ContextRemove);
    const contextName = args['context-name'];
    const context = contextService.deleteContext(contextName);
    if (!context) { throw new ContextNotFound(contextName); }
    console.log(`${contextName} successfully deleted`);
  }
}
