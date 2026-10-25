import $RefParser from '@apidevtools/json-schema-ref-parser';
import { markReferenceError } from './errors';

import type { ParserOptions as $RefParserOptions } from '@apidevtools/json-schema-ref-parser';
import type { AsyncAPIObject, Options as BundlerOptions } from './spec-types';

let RefParserOptions: $RefParserOptions;

/**
 * Function fully dereferences the provided AsyncAPI Document.
 * @param {Object[]} JSONSchema
 * @param {number} specVersion
 * @param {Object} options
 * @private
 */
export async function parse(
  JSONSchema: AsyncAPIObject,
  specVersion: number,
  options: BundlerOptions = {}
) {
  /* eslint-disable indent */
  // It is assumed that there will be major Spec versions 4, 5 and on.
  switch (specVersion) {
    case 2:
      RefParserOptions = {
        dereference: {
          circular: false,
          // prettier-ignore
          excludedPathMatcher: (path: string): any => { // eslint-disable-line
            return;
          },
          onDereference: (path: string, value: AsyncAPIObject) => {
            if (options.xOrigin === true) {
              value['x-origin'] = path;
            }
          },
        },
      };
      break;
    case 3:
      RefParserOptions = {
        dereference: {
          circular: false,
          excludedPathMatcher: (path: string): any => {
            return (
              // prettier-ignore
              (/#\/channels\/.*\/servers/).test(path) ||
              (/#\/operations\/.*\/channel/).test(path) ||
              (/#\/operations\/.*\/messages/).test(path) ||
              (/#\/operations\/.*\/reply\/channel/).test(path) ||
              (/#\/operations\/.*\/reply\/messages/).test(path) ||
              (/#\/components\/channels\/.*\/servers/).test(path) ||
              (/#\/components\/operations\/.*\/channel/).test(path) ||
              (/#\/components\/operations\/.*\/messages/).test(path) ||
              (/#\/components\/operations\/.*\/reply\/channel/).test(path) ||
              (/#\/components\/operations\/.*\/reply\/messages/).test(path)
            );
          },
          onDereference: (path: string, value: AsyncAPIObject) => {
            if (options.xOrigin === true) {
              value['x-origin'] = path;
            }
          },
        },
      };
      break;
    default:
      console.error(
        `There is no support for AsyncAPI Specification v${specVersion}.`
      );
  }

  try {
    return await $RefParser.dereference(JSONSchema, RefParserOptions) as AsyncAPIObject;
  } catch (err) {
    throw markReferenceError(err);
  }
}
