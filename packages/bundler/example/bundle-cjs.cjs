/**
 * In case `.cjs` extension is used, Node.js will recognize CJS module system
 * automatically.
 */

'use strict';

const { writeFileSync } = require('fs');
const bundle = require('@asyncapi/bundler');

async function main() {
  const document = await bundle(['./social-media/comments-service/main.yaml', '../main.yaml'], {
    baseDir: 'example-data',
    xOrigin: true,
  });
  if (document.yml()) {
    writeFileSync('asyncapi.yaml', document.yml());
  }
}

main().catch(e => console.error(e));
