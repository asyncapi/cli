import AsyncAPIDiff from '../src/asyncapidiff';

import {
  breakingChanges,
  inputDiff,
  nonbreakingChanges,
  unclassifiedChanges,
  YAMLBreakingChanges,
  YAMLNonbreakingChanges,
  YAMLOutputDiff,
  YAMLUnclassifiedChanges,
  MarkdownBreakingChanges,
  MarkdownNonbreakingChanges,
  MarkdownOutputDiff,
  MarkdownUnclassifiedChanges,
  MarkdownJSONSubtypeChanges,
  MarkdownYAMLSubtypeChanges,
} from './fixtures/asyncapidiff.fixtures';

import {
  diffOutput
} from './fixtures/main.fixtures';

describe('AsyncAPIDiff wrapper', () => {
  test('checks the instance', () => {
    expect(
      new AsyncAPIDiff(JSON.stringify(inputDiff), {outputType: 'json'})
    ).toBeInstanceOf(AsyncAPIDiff);
  });

  test('JSON: checks the original output', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'json',
    });
    expect(diff.getOutput()).toEqual(inputDiff);
  });

  test('JSON: returns breaking changes', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'json',
    });
    expect(diff.breaking()).toEqual(breakingChanges);
  });

  test('JSON: returns non-breaking changes', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'json',
    });
    expect(diff.nonBreaking()).toEqual(nonbreakingChanges);
  });

  test('JSON: returns unclassified changes', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'json',
    });
    expect(diff.unclassified()).toEqual(unclassifiedChanges);
  });

  test('YAML: checks the original output', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'yaml',
    });
    expect(diff.getOutput()).toEqual(YAMLOutputDiff);
  });

  test('YAML: returns breaking changes', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'yaml',
    });
    expect(diff.breaking()).toEqual(YAMLBreakingChanges);
  });

  test('YAML: returns non-breaking changes', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'yaml',
    });
    expect(diff.nonBreaking()).toEqual(YAMLNonbreakingChanges);
  });

  test('YAML: returns unclassified changes', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'yaml',
    });
    expect(diff.unclassified()).toEqual(YAMLUnclassifiedChanges);
  });

  test('Markdown: returns the original full output', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'markdown',
    });
    expect(diff.getOutput()).toEqual(MarkdownOutputDiff);
  });

  test('Markdown: returns breaking changes', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'markdown',
    });
    expect(diff.breaking()).toEqual(MarkdownBreakingChanges);
  });

  test('Markdown: returns non-breaking changes', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'markdown',
    });
    expect(diff.nonBreaking()).toEqual(MarkdownNonbreakingChanges);
  });

  test('Markdown: returns unclassified changes', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(inputDiff), {
      outputType: 'markdown',
    });
    expect(diff.unclassified()).toEqual(MarkdownUnclassifiedChanges);
  });

  test('Markdown: returns changes using subtype JSON as the default', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(diffOutput), {
      outputType: 'markdown',
    });
    expect(diff.getOutput()).toEqual(MarkdownJSONSubtypeChanges);
  });

  test('Markdown: returns changes using subtype YAML', () => {
    const diff = new AsyncAPIDiff(JSON.stringify(diffOutput), {
      outputType: 'markdown',
      markdownSubtype: 'yaml',
    });
    expect(diff.getOutput()).toEqual(MarkdownYAMLSubtypeChanges);
  });
});
