/**
 * This file is ESM because `example/package.json` sets `"type": "module"`.
 */

import { writeFileSync } from 'node:fs';
import bundle from '@asyncapi/bundler';

const files = [
  'send/lightTurnOn/asyncapi.yaml',
  'send/lightTurnOff/asyncapi.yaml',
  'receive/lightingMeasured/asyncapi.yaml',
];

const document = await bundle(files, {
  base: 'index.yaml',
  baseDir: 'example-with-nested-dirs/asyncapi',
  xOrigin: false,
});
const yaml = document.yml();
if (yaml) {
  writeFileSync('bundled.yaml', yaml);
}
