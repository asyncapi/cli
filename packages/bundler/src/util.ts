import { readFileSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { merge } from 'lodash';
import structuredClone from '@ungap/structured-clone';
import { parse } from './parser';
import { BundlerErrorCode, ParserError, versionMismatchError } from './errors';

import type { AsyncAPIObject, Options } from './spec-types';

/**
 * @private
 */
export const toJS = (asyncapiYAMLorJSON: string | object) => {
  if (!asyncapiYAMLorJSON) {
    throw new ParserError({
      type: 'null-or-falsy-document',
      title: "Document can't be null or falsey.",
      code: BundlerErrorCode.INPUT_INVALID,
    });
  }

  if (asyncapiYAMLorJSON.constructor?.name === 'Object') {
    return asyncapiYAMLorJSON as AsyncAPIObject;
  }

  if (typeof asyncapiYAMLorJSON !== 'string') {
    throw new ParserError({
      type: 'invalid-document-type',
      title: 'The AsyncAPI document has to be either a string or a JS object.',
      code: BundlerErrorCode.INPUT_INVALID,
    });
  }

  if (JSON.stringify(asyncapiYAMLorJSON).trimStart().startsWith('{')) {
    throw new ParserError({
      type: 'invalid-yaml',
      title: 'The provided yaml is not valid.',
      code: BundlerErrorCode.DOCUMENT_PARSE_FAILED,
    });
  }

  return yaml.load(asyncapiYAMLorJSON) as AsyncAPIObject;
};

export function getSpecVersion(asyncapiDocument: AsyncAPIObject): number {
  const versionString = asyncapiDocument.asyncapi;
  return Number.parseInt(versionString, 10);
}

/**
 * @private
 *
 * @param asyncapiDocuments {AsyncAPIObject[]}
 * @returns {boolean}
 */
export function versionCheck(asyncapiDocuments: AsyncAPIObject[]): number {
  let currentVersion = getSpecVersion(asyncapiDocuments[0]);
  for (const asyncapiDocument of asyncapiDocuments) {
    const majorVersion = getSpecVersion(asyncapiDocument);
    if (majorVersion !== currentVersion) {
      throw versionMismatchError(
        'Unable to bundle specification files of different major versions'
      );
    }
    currentVersion = majorVersion;
  }
  return currentVersion;
}

export function isExternalReference(ref: string): boolean {
  return typeof ref === 'string' && !ref.startsWith('#');
}

/**
 *
 * @param {string | string[]} files
 * @param {Object} options
 * @returns {Array<Object>}
 * @private
 */
export const resolve = async (files: string | string[], options: Options) => {
  const parsedJsons: AsyncAPIObject[] = [];

  for (const file of files) {
    const prevDir = process.cwd();

    let filePath: any = file.split('/');
    filePath.pop();
    filePath = filePath.join('/');

    let readFile: any = readFileSync(file, 'utf-8');
    readFile = toJS(readFile);

    if (filePath) {
      process.chdir(path.resolve(prevDir, filePath));
    }

    // Each file is parsed from its own directory. The next file waits until this directory is restored.
    readFile = await parse(readFile, getSpecVersion(readFile), options); // NOSONAR

    parsedJsons.push(readFile);

    if (prevDir) {
      process.chdir(prevDir);
    }
  }

  return parsedJsons;
};

export async function mergeIntoBaseFile(
  baseFilePath: string | string[],
  bundledDocument: AsyncAPIObject,
  majorVersion: number,
  options: Options = {}
) {
  // The base file's path must be an array of exactly one element to be properly
  // iterated in `resolve()`. Even if it was passed to the main script as a
  // string or an array of several elements.
  const baseFilePathAsArray: string[] = [];

  if (typeof baseFilePath === 'string') {
    baseFilePathAsArray.push(baseFilePath);
  } else if (Array.isArray(baseFilePath) && baseFilePath.length >= 1) {
    baseFilePathAsArray.push(baseFilePath[0]);
  }

  const parsedBaseFile: AsyncAPIObject[] = await resolve(
    baseFilePathAsArray,
    options
  );

  if (majorVersion !== getSpecVersion(parsedBaseFile[0])) {
    throw versionMismatchError(
      'Base file has different major version than other specification files'
    );
  }

  return merge(bundledDocument, parsedBaseFile[0]) as AsyncAPIObject;
}

// Purely decorative stuff, just to bring the order of the AsyncAPI Document's
// root properties into a familiar form.
export function orderPropsAccToAsyncAPISpec(
  inputAsyncAPIObject: any
): AsyncAPIObject {
  const orderOfPropsAccToAsyncAPISpec = [
    'asyncapi',
    'id',
    'info',
    'tags', // v2-specific root property
    'externalDocs', // v2-specific root property
    'defaultContentType',
    'servers',
    'channels',
    'operations',
    'components',
  ];

  const outputAsyncAPIObject: any = {};
  let i = 0;

  // Making the best guess where root properties that are not specified in the
  // AsyncAPI Specification were located in the original AsyncAPI Document
  // (inserting them between known root properties.)
  // DISCLAIMER: The original order is not guaranteed, it is only an
  // extrapolating guess.
  for (const key of Object.keys(inputAsyncAPIObject)) {
    if (!orderOfPropsAccToAsyncAPISpec.includes(key)) {
      orderOfPropsAccToAsyncAPISpec.splice(i, 0, key);
    }
    i++;
  }

  // Merging of known AsyncAPI Object root properties in a familiar order.
  for (const prop of orderOfPropsAccToAsyncAPISpec) {
    if (inputAsyncAPIObject[`${prop}`]) {
      outputAsyncAPIObject[`${prop}`] = structuredClone(
        inputAsyncAPIObject[`${prop}`]
      );
    }
  }

  return outputAsyncAPIObject as AsyncAPIObject;
}
