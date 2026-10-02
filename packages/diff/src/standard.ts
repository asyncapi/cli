import { getDocumentMajorVersion } from './helpers/DiffHelpers';
import { standard as v2Standard } from './standards/v2';
import { standard as v3Standard } from './standards/v3';
import { StandardType } from 'types';

export function getStandardFromVersion(document: any): StandardType {
  const majorVersion = getDocumentMajorVersion(document);
  const source = majorVersion === '2' ? v2Standard : v3Standard;
  // Copy so an override cannot change later calls that share this process.
  return JSON.parse(JSON.stringify(source)) as StandardType;
}
