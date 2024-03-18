import Command from '../../core/base';
import { runApi } from '../../../../api';
import { apiFlags } from '../../core/flags/start/api.flags';

const defaultPort = 3001;

export default class StartApi extends Command {
  static description = 'starts a new local instance of AsyncAPI';

  static flags = apiFlags(defaultPort);

  static args = [];

  async run() {
    const { flags } = await this.parse(StartApi);
    const port = flags.port;

    await runApi(port);
  }
}
