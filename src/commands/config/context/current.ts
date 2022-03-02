import { Flags } from '@oclif/core';
import Command from '../../../base';
import { getCurrentContext } from '../../../models/Context';

export default class ContextCurrent extends Command {
  static description='Shows the current context that is being used';
  static flags={
    help: Flags.help({char: 'h'})
  }

  async run() {
    const { current, context } = await getCurrentContext();
    this.log(`${current}: ${context}`);
  }
}
