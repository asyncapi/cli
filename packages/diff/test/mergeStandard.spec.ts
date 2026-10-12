import { mergeStandard } from '../src/mergeStandard';
import { OverrideObject } from '../src/types';
import { getStandardFromVersion } from '../src/standard';

import {
  newKey,
  exisitngKey,
  standardAsString,
  mergedStandardAsString,
} from './fixtures/mergeStandard.fixture';

describe('mergeStandard()', () => {
  test('with empty override object', () => {
    const standard = getStandardFromVersion({asyncapi: '2.1.0'});
    mergeStandard(standard, {});
    expect(JSON.stringify(standard)).toBe(standardAsString);
  });

  test('with new override key', () => {
    const standard = getStandardFromVersion({asyncapi: '2.1.0'});
    mergeStandard(standard, newKey as OverrideObject);
    expect(JSON.stringify(standard)).toBe(mergedStandardAsString);
  });

  test('with exisiting override key', () => {
    const standard = getStandardFromVersion({asyncapi: '2.1.0'});
    mergeStandard(standard, exisitngKey as OverrideObject);
    expect(standard['/servers']).toEqual(exisitngKey['/servers']);
    expect(standard['/newKey']).toBeUndefined();
  });
});
