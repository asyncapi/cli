/**
 * In case `.mjs` extension is used, Node.js will recognize ESM module system
 * automatically.
 */

'use strict';

import { writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
  const document = await bundle(['./main.yaml'], {
    xOrigin: true,
  });
  if (document.yml()) {
    writeFileSync('asyncapi.yaml', document.yml());
  }
}

main().catch(e => console.error(e));
