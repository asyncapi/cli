import {Command} from '@oclif/core';

export default abstract class extends Command {
  async catch(e: any) {
    console.error(`${e.name}: ${e.message}`);
  }
}
