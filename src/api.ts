import { App } from './adapters/api/core/app';
import { PingController } from './adapters/api/controllers/ping.controller';
import { GeneratorController } from './adapters/api/controllers/generator.controller';

export async function runApi(port: string| number) {
  const app = new App([
    new PingController(),
    new GeneratorController()
  ], port);
  await app.init();
  return app.listen();
}
// runApi();
