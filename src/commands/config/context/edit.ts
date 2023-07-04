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
    {name: 'new-spec-file-path', description: 'new file path of the spec file', required: true}
  ];

  async run() {
    const {args} = await this.parse(ContextEdit);
    const contextName = args['context-name'];
    const newSpecFilePath = args['new-spec-file-path'];

    await editContext(contextName, newSpecFilePath);
    this.log(`Edited context "${contextName}".\n\nYou can set it as your current context: asyncapi config context use ${contextName}\nYou can use this context when needed by passing ${contextName} as a parameter: asyncapi validate ${contextName}`);
  }
}
