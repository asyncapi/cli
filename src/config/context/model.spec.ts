import { Context, ContextAllocator } from './model';
import { CONTEXTFILE_PATH, ContextTestingHelper } from '../../constants';

const testingHelper = new ContextTestingHelper();

const contextAllocator = new ContextAllocator();

describe('ContextAllocator should ', () => {
  test('have test contextFile path', () => {
    expect(contextAllocator.contextFilePath).toMatch(CONTEXTFILE_PATH);
  });

  test('load context from test env path if present', () => {
    testingHelper.createDummyContextFile();
    const ctx = contextAllocator.load();
    expect(ctx).toBeDefined();
    expect(ctx instanceof Context).toBeTruthy();
  });

  test('return undefined if context file not present in root dir', () => {
    testingHelper.deleteDummyContextFile();
    expect(contextAllocator.load()).toBeUndefined();
  });
});

