import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import type AjvCore from 'ajv/dist/core';

export function createAjvInstance(): AjvCore {
  const ajv = new Ajv({
    allErrors: true,
    meta: true,
    strict: false,
    allowUnionTypes: true,
    logger: false,
    unicodeRegExp: false,
  });
  addFormats(ajv);
  return ajv;
}
