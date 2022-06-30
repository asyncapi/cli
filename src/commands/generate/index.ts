import Command from '../../base';
import { Help } from '@oclif/core';

export default class Generate extends Command {
    static description = 'Generate typed models or templates'
    async run() {
      const help = new Help(this.config);
      help.showHelp(['generate', '--help']);
    }
}
