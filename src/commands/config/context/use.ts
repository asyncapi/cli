import { flags } from '@oclif/command';
import Command from '../../../base';
import { container } from 'tsyringe';
import { ContextService } from '../../../config/context';
import { ContextNotFound } from '../../../errors/context-error';

const contextService = container.resolve(ContextService);

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
    const context = contextService.updateCurrent(contextName);
    if (!context) { throw new ContextNotFound(contextName); }
    console.log(`${contextName} is set as current`);
  }
}
