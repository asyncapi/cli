import { getDocumentMajorVersion } from './helpers/diffHelpers';
import { standard as v2Standard } from './standards/v2';
import { standard as v3Standard } from './standards/v3';
import { StandardType } from 'types';

export function getStandardFromVersion(document: any): StandardType {
  const majorVersion = getDocumentMajorVersion(document);
  const source = majorVersion === '2' ? v2Standard : v3Standard;
  // Each call gets its own table. mergeStandard writes the caller's overrides into this object.
  return JSON.parse(JSON.stringify(source)) as StandardType;
}
