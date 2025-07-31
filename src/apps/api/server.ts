// include configs in the `dist` folder
import './configs/production.json';
import './configs/development.json';
import './configs/test.json';

// for `config` module
process.env['NODE_CONFIG_DIR'] = `${__dirname}/configs`;

import { App } from './app';
import { CONTROLLERS } from '.';

async function main() {
  const app = new App(CONTROLLERS);
  await app.init();
  app.listen();
}
main();
