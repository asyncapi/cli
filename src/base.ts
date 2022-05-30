import {Command} from '@oclif/core';

export default abstract class extends Command {
  async catch(e: any) {
    this.error(`${e.name}: ${e.message}`, {exit: 1});
  }
}
