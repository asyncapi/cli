/**
 * To use `.js` extension with CJS module system, make sure
 * `package.json`
 * DOES NOT contain line
 * `"type": "module",`
 */

'use strict';

const { readFileSync, writeFileSync } = require('fs');
const bundle = require('@asyncapi/bundler');

async function main() {
  const filePaths = ['./camera.yml', './audio.yml'];
  const document = await bundle(filePaths, {
    base: ['./base.yml'],
    xOrigin: true,
  });
  if (document.yml()) {
    writeFileSync('asyncapi.yaml', document.yml());
  }
}

main().catch(e => console.error(e));
