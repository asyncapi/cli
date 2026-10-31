import { OverrideObject, StandardType } from './types';

/**
 * Merges two standard objects
 * @param standard The original standard object
 * @param overrides The object containing the overrides
 *
 * @private
 */
export function mergeStandard(
  standard: StandardType,
  overrides: OverrideObject
): void {
  // modifies the passed standard object
  Object.assign(standard, overrides);
}
