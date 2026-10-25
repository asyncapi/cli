import yaml from 'js-yaml';

import type { AsyncAPIObject } from './spec-types';

/**
 * @class
 *
 * @example
 *
 * const document = new Document(bundledDocument);
 *
 * console.log(document.json()); // get JSON object
 * console.log(document.yml()); // get YAML string
 * console.log(document.string()); // get JSON string
 */

export class Document {
  private _doc: AsyncAPIObject;

  /**
   * @param {Object} AsyncAPIObject
   */
  constructor(bundledDocument: AsyncAPIObject) {
    this._doc = bundledDocument;
  }

  /**
   * @return {Object}
   */
  json() {
    if (Object.keys(this._doc).length) {
      return this._doc;
    }
  }

  /**
   * @return {string}
   */
  yml() {
    if (Object.keys(this._doc).length) {
      return yaml.dump(this._doc);
    }
  }

  /**
   * @return {string}
   */
  string() {
    if (Object.keys(this._doc).length) {
      return JSON.stringify(this._doc);
    }
  }
}
