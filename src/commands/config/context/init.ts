import os from 'os';
import { Flags } from '@oclif/core';
import Command from '../../../base';
import { initContext } from '../../../models/Context';

export default class ContextInit extends Command {
  static description = 'Initialize context';
  static flags = {
    help: Flags.help({ char: 'h' }),
  };

  static contextFilePathMessage = `Specify directory in which context file should be created:
    - current directory          : asyncapi config context init .
    - root of current repository : asyncapi config context init ./
    - user's home directory      : asyncapi config context init ~`;

  static args = [
    {
      name: 'context-file-path',
      description: `${ContextInit.contextFilePathMessage}`,
      required: true,
    },
    { name: 'context-name', description: 'Context name', required: false },
    {
      name: 'spec-file-path',
      description: 'Filesystem path to the target AsyncAPI document',
      required: false,
    },
  ];

  async run() {
    const { args } = await this.parse(ContextInit);
    const contextFilePath = args['context-file-path'];
    const contextName = args['context-name'];
    const specFilePath = args['spec-file-path'];

    if (!['.', './', os.homedir()].includes(contextFilePath)) {
      this.log(`${ContextInit.contextFilePathMessage}`);
      return;
    }

    const contextWritePath = await initContext(
      contextFilePath,
      contextName,
      specFilePath
    );
    this.log(`Initialized context ${contextWritePath}`);
  }
}
