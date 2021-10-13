import { flags} from '@oclif/command';
import Command from '../../../base';
import {ContextService} from '../../../config/context';
import {container} from 'tsyringe';
import { SpecificationFile } from '../../../hooks/validation';

const contextService = container.resolve(ContextService);

export default class ContextAdd extends Command {
  static description='Add or modify a context in the store';
  static flags = {
    help: flags.help({char: 'h'})
  }

  static args = [
    {name: 'context-name', description: 'context name', required: true},
    {name: 'spec-file-path', description: 'file path of the spec file', required: true}
  ]

  async run() {
    const {args} = this.parse(ContextAdd);
    const contextName = args['context-name'];
    const specFilePath = args['spec-file-path'];
    contextService.addContext(contextName, new SpecificationFile(specFilePath));
    const context = contextService.context;
    console.log(`${contextName}: ${context?.getContext(contextName)}`);
  }
}
