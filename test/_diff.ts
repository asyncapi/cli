import Command from '../src/core/base';

export default class Diff extends Command {
  static hidden = true;
  static description = 'This command is disabled';

  async run() {
    this.log('Diff command is disabled.');
  }
}
