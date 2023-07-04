import {Flags} from '@oclif/core';
import Command from '../../../base';
import { editContext } from '../../../models/Context';

export default class ContextEdit extends Command {
  static description='Edit a context in the store';
  static flags = {
    help: Flags.help({char: 'h'})
  };

  static args = [
    {name: 'context-name', description: 'context name', required: true},
    {name: 'spec-file-path', description: 'file path of the spec file', required: true}
  ];

  async run() {
    const {args} = await this.parse(ContextEdit);
    const contextName = args['context-name'];
    const specFilePath = args['spec-file-path'];

    await editContext(contextName, specFilePath);
    this.log(`Edited context "${contextName}".\n\nYou can set it as your current context: asyncapi config context use ${contextName}\nYou can use this context when needed by passing ${contextName} as a parameter: asyncapi validate ${contextName}`);
  }
}
