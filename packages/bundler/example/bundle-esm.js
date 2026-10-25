/**
 * To use `.js` extension with ESM module system, first add to
 * `package.json`
 * line
 * `"type": "module",`
 */

'use strict';

import { writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
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
  if (document.yml()) {
    writeFileSync('bundled.yaml', document.yml());
  }
}

main().catch(e => console.error(e));
