import { flags } from '@oclif/command';
import Command from '../../../base';
import { removeContext } from '../../../models/Context';

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
    
    try {
      await removeContext(contextName);
      this.log(`${contextName} successfully deleted`);
    } catch (err) {
      this.error(err as Error);
    }
  }
}
