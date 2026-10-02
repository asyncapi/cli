/* eslint-disable security/detect-object-injection */
// Disabling this since the property we are accessing will always have `/` as the prefix
// Thus preventing the prototype chain attacks

import { OverrideStandard } from '../types';

/**
 * Changes the last element of array to `*`
 * @param path The path in form of an array
 * @returns The path in form of a string with `*` at the end
 *
 * @example
 * changeLastElementToPlaceholder(['', 'servers', 'production']); // '/servers/*'
 *
 * @private
 */
export function changeLastElementToPlaceholder(path: string[]): string {
  path.pop();
  path.push('*');
  return path.join('/');
}

/**
 * Generates the correct path to get the classification data from standard
 * @param standard The standard object
 * @param path The JSONpointer path to find
 * @returns The path found
 *
 * @private
 */
export function generateClassifierPath(
  standard: OverrideStandard,
  path: string
): string | undefined {
  // See this PR for a detailed walkthrough of this code with an example: https://github.com/asyncapi/diff/pull/19
  const pathArray = path.split('/');
  for (let i = 0; i < pathArray.length; i++) {
    const slicedPathSegment = pathArray.slice(0, i + 1);
    const pathSegment = slicedPathSegment.join('/');
    if (pathSegment === '') {
      continue;
    }
    if (standard[pathSegment]) {
      // if the property is found, skip the steps and move onto next iteration
      continue;
    }
    const newPathSegment = changeLastElementToPlaceholder(slicedPathSegment);
    if (!standard[newPathSegment]) {
      // path with * not found
      return undefined;
    }
    pathArray[i] = '*';
  }
  return pathArray.join('/');
}
