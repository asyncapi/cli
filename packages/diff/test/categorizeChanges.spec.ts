import categorizeChanges from '../src/categorizeChanges';
import { DiffOutput, OverrideStandard } from '../src/types';

import {
  standard,
  inputDiffOutput,
  finalDiffOutput,
  finalDiffOutputAsUnclassified,
} from './fixtures/categorizeChanges.fixtures';

describe('categorizeChanges', () => {
  test('checks the final output', () => {
    expect(
      categorizeChanges(
        standard as OverrideStandard,
        inputDiffOutput as DiffOutput[]
      )
    ).toStrictEqual(finalDiffOutput);
  });

  test('returns unclassified when passed with empty standard', () => {
    expect(
      categorizeChanges({} as OverrideStandard, inputDiffOutput as DiffOutput[])
    ).toStrictEqual(finalDiffOutputAsUnclassified);
  });
});
