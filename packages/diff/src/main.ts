import { Config, OverrideStandard } from './types';
import generateDiff from './generateDiff';
import { getStandardFromVersion } from './standard';
import categorizeChanges from './categorizeChanges';
import AsyncAPIDiff from './asyncapidiff';
import { mergeStandard } from './mergeStandard';
import { incompatibleDocuments } from './helpers/diffHelpers';
import { DiffOverrideInvalidError, DiffVersionMismatchError } from './errors';

/**
 * Generates diff between two AsyncAPI documents
 * @param firstDocument The parsed AsyncAPI document
 * @param secondDocument The parsed AsyncAPI document
 * @param config Configuration options
 * @param {object} [config.override] Object to override the standard
 * @param {string} [config.outputType] The type of output
 * @returns {AsyncAPIDiff} The diff data
 *
 * @example
 * ```
 * const output = diff(firstDocument, secondDocument, {
 *  override: {
 *    '/servers': {
 *      add: 'non-breaking', // when a property has been added in the AsyncAPI document
 *      remove: 'breaking',  // when a property has been removed from the AsyncAPI document
 *      edit: 'unclassified' // when a property has been edited in the AsyncAPI document
 *    }
 *  },
 *  outputType: "yaml"
 * })
 * ```
 */
export function diff(
  firstDocument: any,
  secondDocument: any,
  config: Config = {}
): AsyncAPIDiff {
  if (incompatibleDocuments(firstDocument, secondDocument)) {
    throw new DiffVersionMismatchError();
  }

  const standard = getStandardFromVersion(firstDocument);

  if (config.override) {
    if (typeof config.override !== 'object') {
      throw new DiffOverrideInvalidError();
    }
    mergeStandard(standard, config.override);
  }

  const diffOutput = generateDiff(firstDocument, secondDocument);
  const output = categorizeChanges(standard as OverrideStandard, diffOutput);
  return new AsyncAPIDiff(JSON.stringify(output), {
    outputType: config.outputType ?? 'json',
    markdownSubtype: config.markdownSubtype ?? 'json',
  });
}
