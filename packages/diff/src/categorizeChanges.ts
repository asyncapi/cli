import classifier from './classifier';
import { Output, DiffOutput, DiffOutputItem, OverrideStandard } from './types';

/**
 * Categorize the changes
 * @param standard The standard object
 * @param diffs The array of diff changes
 * @returns The final output containing the diff changes as well as the type of change
 *
 * @private
 */
export default function categorizeChanges(
  standard: OverrideStandard,
  diffs: DiffOutput[]
): Output {
  // the final output
  const output: Output = {
    changes: [],
  };

  for (const diff of diffs) {
    const newDiffObject = { ...diff } as DiffOutputItem;
    const classifierObject = classifier(standard, diff.path);
    newDiffObject.type = classifierObject[diff.action] || 'unclassified';
    output.changes.push(newDiffObject);
  }

  return output;
}
