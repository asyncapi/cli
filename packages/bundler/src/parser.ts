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
  // Later major versions can be added as cases. An unknown version falls through with no exclusions.
  switch (specVersion) {
    case 2:
      RefParserOptions = {
        dereference: {
          circular: false,
          excludedPathMatcher: (): boolean => false,
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
          // Skip only the Reference Object slots themselves, so schema properties that
          // happen to be named `servers`, `channel` or `messages` are still dereferenced.
          excludedPathMatcher: (path: string): boolean => {
            return (
              // prettier-ignore
              (/^#\/(components\/)?channels\/[^/]+\/servers$/).test(path) ||
              (/^#\/(components\/)?operations\/[^/]+(\/reply)?\/(channel|messages)$/).test(path)
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
