import {Flags} from '@oclif/core';
import Command from '../../base';
import { runApi } from '../../../../api';

export default class StartApi extends Command {
  static description = 'starts a new local instance of AsyncAPI';

  static flags = {
    help: Flags.help({ char: 'h' }),
    port: Flags.integer({ char: 'p', description: 'port in which to start API', default: 3001 }),
  };

  static args = [];

  async run() {
    const { flags } = await this.parse(StartApi);
    const port = flags.port;

    await runApi(port);
  }
}
