import { compare } from 'fast-json-patch';

import { formatDiffOutput } from './helpers/DiffHelpers';
import { DiffOutput } from './types';

/**
 * Generates the diff
 * @param {*} firstDocument The first document in JSON format
 * @param {*} secondDocument The second document in JSON format
 * @returns {DiffOutput[]} An array containing all the diffs
 *
 * @private
 */
export default function generateDiff(
  firstDocument: any,
  secondDocument: any
): DiffOutput[] {
  const diffOutput = compare(firstDocument, secondDocument);
  return formatDiffOutput(diffOutput, firstDocument);
}
