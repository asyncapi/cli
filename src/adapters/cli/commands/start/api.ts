process.env['NODE_CONFIG_DIR'] = `${__dirname}/../../../api/configs`;

import Command from '@cli/internal/base';
import { apiFlags } from '../../internal/flags/start/api.flags';
import { App } from '@/adapters/api/app';
import { CONTROLLERS } from '@/adapters/api';

export default class Api extends Command {
  static readonly description = 'starts the AsyncAPI server API.';

  static readonly flags = apiFlags();

  static readonly args = {};

  async run () {
    const { flags } = await this.parse(Api);

    const app = new App(
      CONTROLLERS,
      flags.port || 3000, // Default port if not specified
      flags.mode
    );

    await app.init();
    app.listen();
  }
}
