/* eslint-disable security/detect-object-injection */
// Disabling this since the property we are accessing will always have `/` as the prefix
// Thus preventing the prototype chain attacks

import { unclassified } from './constants';
import { generateClassifierPath } from './helpers/ClassifierHelpers';
import { Classifier, OverrideStandard } from './types';

/**
 * Gets the classifier object from the standard object using the provided path
 * @param standard The standard object
 * @param path The JSONpointer path provided by the diff
 * @returns The classifier object containing `add`, `remove` & `edit` properties
 *
 * @private
 */
export default function classifier(
  standard: OverrideStandard,
  path: string
): Classifier {
  const classifierPath = generateClassifierPath(standard, path);
  if (!classifierPath) {
    return {
      add: unclassified,
      remove: unclassified,
      edit: unclassified,
    };
  }
  return standard[classifierPath];
}
