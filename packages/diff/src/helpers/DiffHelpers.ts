import { Operation, getValueByPointer } from 'fast-json-patch';

import { DiffOutput, ValueOperation, ActionType } from '../types';

/**
 * Formats the action to have one of `add`, `remove` or `edit` values
 * @param {String} action The action performed by the diff library
 * @returns {String} The formatted action output
 *
 * @private
 */
export function formatAction(action: string): ActionType {
  if (action === 'replace') {
    return 'edit';
  }
  // since `add` and `remove` are already provided by the library, we don't need to change that.
  return action as ActionType;
}

/**
 * Get the `before` value from the first document
 * @param firstDocument The first document which we will get the before value from
 * @param {String} path The path from where we can get the value
 * @returns The value from the first document
 *
 * @private
 */
export function getBeforeValue(firstDocument: any, path: string): any {
  // since our current diffing library doesn't provide the `before` value
  // we have to get it manually from the first document
  return getValueByPointer(firstDocument, path);
}

/**
 * Get the `after` value
 * @param diffObject A single diff object
 * @returns The value that is present inside the second document
 *
 * @private
 */
export function getAfterValue(diffObject: Operation): any {
  // The diffing library already provides the `after` value for `add` or `edit` actions
  return (diffObject as ValueOperation).value;
}

/**
 * Sets the index property in case of an array change
 * @param changeObject The change object
 * @param {String} path The original path
 *
 * @private
 */
export function setIndex(
  changeObject: DiffOutput,
  firstDocument: any,
  path: string
): void {
  const splittedPath = path.split('/');
  const lastPathElement = splittedPath[splittedPath.length - 1];
  const lastElementNumber = Number(lastPathElement);
  splittedPath.pop();
  const assembledPath = splittedPath.join('/');
  if (
    !Number.isNaN(lastElementNumber) &&
    Array.isArray(getValueByPointer(firstDocument, assembledPath))
  ) {
    // if the last element is a Number
    // and the path before the last element is an array
    // then the change has been made inside an array, therefore set index as true
    changeObject.isArrayIndex = true;
  }
}

/**
 * Formats the original diff output
 * @param {Operation[]} diff The original diff array
 * @param {*} firstDocument The first document
 * @returns {DiffOutput[]} The modified diffs array
 *
 * @private
 */
export function formatDiffOutput(
  diffInput: Operation[],
  firstDocument: any
): DiffOutput[] {
  const output: DiffOutput[] = [];
  for (const value of diffInput) {
    const changeObject = {} as DiffOutput;
    changeObject.action = formatAction(value.op);
    changeObject.path = value.path;
    setIndex(changeObject, firstDocument, value.path);
    if (value.op === 'remove' || value.op === 'replace') {
      changeObject.before = getBeforeValue(firstDocument, value.path);
    }
    if (value.op === 'replace' || value.op === 'add') {
      changeObject.after = getAfterValue(value);
    }
    output.push(changeObject);
  }
  return output;
}

export function getDocumentMajorVersion(document: any): string {
  const asyncapiVersion: string = document.asyncapi;
  return asyncapiVersion.split('.')[0];
}

export function incompatibleDocuments(
  firstDocument: any,
  secondDocument: any
): boolean {
  const firstDocumentMajorVersion = getDocumentMajorVersion(firstDocument);
  const secondDocumentMajorVersion = getDocumentMajorVersion(secondDocument);
  if (firstDocumentMajorVersion !== secondDocumentMajorVersion) {
    return true;
  }
  return false;
}
