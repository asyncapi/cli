import classifier from '../src/classifier';
import { OverrideStandard } from '../src/types';

import {
  correctClassification,
  demoStandard,
  unclassifiedChange,
} from './fixtures/classifier.fixtures';

describe('classifier', () => {
  test('should return unclassified in case of empty standard', () => {
    expect(classifier({} as OverrideStandard, '/some/path')).toStrictEqual(
      unclassifiedChange
    );
  });

  test('should return the correct classification with correct path', () => {
    expect(
      classifier(demoStandard as OverrideStandard, '/servers')
    ).toStrictEqual(correctClassification);
  });

  test('should return the correct classification with placeholder path', () => {
    expect(
      classifier(demoStandard as OverrideStandard, '/servers/google')
    ).toStrictEqual(correctClassification);
  });

  test('should return the correct classification with placeholder path', () => {
    expect(
      classifier(demoStandard as OverrideStandard, '/servers/google/protocol')
    ).toStrictEqual(correctClassification);
  });
});
