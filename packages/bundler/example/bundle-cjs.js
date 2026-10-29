/**
 * `example/package.json` sets `"type": "module"`, so this `.js` file is ESM.
 * The CommonJS sample is `bundle-cjs.cjs`.
 */

import { writeFileSync } from 'node:fs';
import bundle from '@asyncapi/bundler';

const filePaths = ['./camera.yml', './audio.yml'];
const document = await bundle(filePaths, {
  base: ['./base.yml'],
  xOrigin: true,
});
const yaml = document.yml();
if (yaml) {
  writeFileSync('asyncapi.yaml', yaml);
}
