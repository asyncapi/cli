process.env['NODE_CONFIG_DIR'] = `${__dirname}/../../../api/configs`;

import Command from '@cli/internal/base';
import { apiFlags } from '../../internal/flags/start/api.flags';
import { App } from '@/apps/api/app';
import { CONTROLLERS } from '@/apps/api';

export default class Api extends Command {
  static readonly description = 'starts the AsyncAPI server API.';

  static readonly flags = apiFlags();

  static readonly args = {};

  async run() {
    const { flags } = await this.parse(Api);

    const app = new App(
      CONTROLLERS,
      flags.port || 3000, // Default port if not specified
      flags.mode,
    );

    await app.init();
    const { host, port, url } = await app.listen(this.jsonEnabled());

    if (this.jsonEnabled()) {
      this.emitStructuredOutput(this.result('Server started.', {
        event: 'server.started',
        mode: flags.mode,
        host,
        port,
        url,
        pid: process.pid,
        warnings: [],
      }));
    }
  }
}
