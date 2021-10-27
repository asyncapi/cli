import { flags } from '@oclif/command';
import Command from '../../../base';
import { setCurrentContext } from '../../../models/Context';

export default class ContextUse extends Command {
  static description = 'Set a context as current';

  static flags = {
    help: flags.help({ char: 'h' })
  }

  static args = [
    { name: 'context-name', description: 'name of the saved context', required: true }
  ]

  async run() {
    const { args } = this.parse(ContextUse);
    const contextName = args['context-name'];
    await setCurrentContext(contextName);
    this.log(`${contextName} is set as current`);
  }
}
