import { App } from './adapters/api/app';
import { PingController } from './adapters/api/controllers/ping.controller';
import { GeneratorController } from './adapters/api/controllers/generator.controller';

export async function runApi(port: string| number) {
  const app = new App([
    new PingController(),
    new GeneratorController()
  ], port);
  await app.init();
  app.listen();
}
// runApi();
