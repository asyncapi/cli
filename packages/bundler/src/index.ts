import path from 'path';
import { merge } from 'lodash';
import {
  resolve,
  versionCheck,
  orderPropsAccToAsyncAPISpec,
  mergeIntoBaseFile,
} from './util';

import { Document } from './document';
import { BundlerErrorCode, ParserError } from './errors';

import type { AsyncAPIObject, Options } from './spec-types';
export type { AsyncAPIObject, Options } from './spec-types';
export { Document, BundlerErrorCode, ParserError };

// remember the directory where execution of the program started
const originDir = String(process.cwd());

/**
 *
 * @param {string | string[]} files One or more relative/absolute paths to
 * AsyncAPI Documents that should be bundled.
 * @param {Object} [options]
 * @param {string} [options.base] One relative/absolute path to base object whose
 * properties will be retained.
 * @param {string} [options.baseDir] One relative/absolute path to directory
 * relative to which paths to AsyncAPI Documents that should be bundled will be
 * resolved.
 * @param {boolean} [options.xOrigin] Pass `true` to generate properties
 * `x-origin` that will contain historical values of dereferenced `$ref`s.
 *
 * @return {Document}
 *
 * @example
 *
 ***TypeScript**
 *```ts
 *import { writeFileSync } from 'fs';
 *import bundle from '@asyncapi/bundler';
 *
 *async function main() {
 *  const document = await bundle(['social-media/comments-service/main.yaml'], {
 *    baseDir: 'example-data',
 *    xOrigin: true,
 *  });
 *
 *  console.log(document.yml()); // the complete bundled AsyncAPI document
 *  writeFileSync('asyncapi.yaml', document.yml());  // the complete bundled AsyncAPI document
 *}
 *
 *main().catch(e => console.error(e));
 *```
 *
 ***JavaScript CJS module system**
 *```js
 *'use strict';
 *
 *const { writeFileSync } = require('fs');
 *const bundle = require('@asyncapi/bundler');
 *
 *async function main() {
 *  const document = await bundle(['social-media/comments-service/main.yaml'], {
 *    baseDir: 'example-data',
 *    xOrigin: true,
 *  });
 *  writeFileSync('asyncapi.yaml', document.yml());
 *}
 *
 *main().catch(e => console.error(e));
 *```
 *
 ***JavaScript ESM module system**
 *```js
 *'use strict';
 *
 *import { writeFileSync } from 'fs';
 *import bundle from '@asyncapi/bundler';
 *
 *async function main() {
 *  const document = await bundle(['social-media/comments-service/main.yaml'], {
 *    baseDir: 'example-data',
 *    xOrigin: true,
 *  });
 *  writeFileSync('asyncapi.yaml', document.yml());
 *}
 *
 *main().catch(e => console.error(e));
 *```
 *
 */
export default async function bundle(
  files: string[] | string,
  options: Options = {}
) {
  let bundledDocument: any = {};

  // if one string was passed, convert it to an array
  if (typeof files === 'string') {
    files = Array.from(files.split(' '));
  }

  if (options.baseDir && typeof options.baseDir === 'string') {
    process.chdir(path.resolve(originDir, options.baseDir));
  } else if (options.baseDir && Array.isArray(options.baseDir)) {
    process.chdir(path.resolve(originDir, String(options.baseDir[0]))); // guard against passing an array
  }

  const parsedJsons: AsyncAPIObject[] = await resolve(files, options);

  const majorVersion = versionCheck(parsedJsons);

  for (const parsedJson of parsedJsons) {
    bundledDocument = merge(bundledDocument, parsedJson);
  }

  if (options.base) {
    bundledDocument = await mergeIntoBaseFile(
      options.base,
      bundledDocument,
      majorVersion,
      options
    );
  }

  // Purely decorative stuff, just to bring the order of the AsyncAPI Document's
  // properties into a familiar form.
  bundledDocument = orderPropsAccToAsyncAPISpec(bundledDocument);

  // return to the starting directory before finishing the execution
  if (options.baseDir) {
    process.chdir(originDir);
  }

  return new Document(bundledDocument as AsyncAPIObject);
}

// 'module.exports' is added to maintain backward compatibility with Node.js
// projects, that use CJS module system.
module.exports = bundle;
module.exports.Document = Document;
module.exports.BundlerErrorCode = BundlerErrorCode;
module.exports.ParserError = ParserError;
