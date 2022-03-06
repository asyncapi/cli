import {Flags} from '@oclif/core';
import Command from '../../../base';
import { addContext } from '../../../models/Context';

export default class ContextAdd extends Command {
  static description='Add or modify a context in the store';
  static flags = {
    help: Flags.help({char: 'h'})
  }

  static args = [
    {name: 'context-name', description: 'context name', required: true},
    {name: 'spec-file-path', description: 'file path of the spec file', required: true}
  ]

  async run() {
    const {args} = await this.parse(ContextAdd);
    const contextName = args['context-name'];
    const specFilePath = args['spec-file-path'];

    await addContext(contextName, specFilePath);
    this.log(`Added context "${contextName}".\n\nYou can set it as your current context: asyncapi context use ${contextName}\nYou can use this context when needed by passing ${contextName} as a parameter: asyncapi validate ${contextName}`);
  }
}
