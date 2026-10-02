import {
  changeLastElementToPlaceholder,
  generateClassifierPath,
} from '../src/helpers/ClassifierHelpers';
import { OverrideStandard } from '../src/types';

import { demoStandard } from './fixtures/classifier.fixtures';
import { pathAsArray } from './fixtures/ClassifierHelpers.fixtures';

describe('changeLastElementToPlaceholder function', () => {
  test('when passed an empty array', () => {
    expect(changeLastElementToPlaceholder([])).toBe('*');
  });

  test('should return correct output', () => {
    expect(changeLastElementToPlaceholder(pathAsArray)).toBe('/servers/*');
  });
});

describe('generateClassifierPath function', () => {
  test('should return undefined when passed an empty standard', () => {
    expect(generateClassifierPath({} as OverrideStandard, '/')).toEqual(
      undefined
    );
  });

  test('should return correct path', () => {
    expect(
      generateClassifierPath(demoStandard as OverrideStandard, '/servers')
    ).toBe('/servers');
  });

  test('should return correct path', () => {
    expect(
      generateClassifierPath(
        demoStandard as OverrideStandard,
        '/servers/google'
      )
    ).toBe('/servers/*');
  });

  test('shold return undefined for non-existing path', () => {
    expect(
      generateClassifierPath(
        demoStandard as OverrideStandard,
        '/servers/google/someProperty'
      )
    ).toEqual(undefined);
  });

  test('shold return correct path', () => {
    expect(
      generateClassifierPath(
        demoStandard as OverrideStandard,
        '/servers/google/protocol'
      )
    ).toBe('/servers/*/protocol');
  });
});
