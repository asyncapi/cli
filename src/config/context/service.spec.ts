import { ContextService } from './service';
import { Context, IContextAllocator } from './model';

class MockNegativeContextAllocator implements IContextAllocator {
  contextFilePath?: string | undefined;
  load() {
    return undefined;
  }

  save(_context: Context) {
    return undefined;
  }
}

class MockPositiveContextAllocator implements IContextAllocator {
  load() {
    return new Context({
      current: 'test',
      store: {
        test: './test/specification.yml',
        check: './test/specfication.yml'
      }
    });
  }

  save(context: Context) {
    return context;
  }
}

describe('ContextService should', () => {
  test('load undefined context', () => {
    const contextService = new ContextService(new MockNegativeContextAllocator());
    expect(contextService.context).toBeUndefined();
  });
});

let ctxService: ContextService;

describe('ContextService should', () => {
  beforeEach(() => {
    ctxService = new ContextService(new MockPositiveContextAllocator());
  });

  test('load context when available', () => {
    const ctx = ctxService.context;
    expect(ctx).toBeDefined();
  });

  test('successfully save context', () => {
    expect(ctxService.addContext('home', 'path')).toBeTruthy();
  });

  test('successfully delete context', () => {
    const res = ctxService.deleteContext('test');
    expect(res).toBeTruthy();
    expect(ctxService.context?.getContext('test')).toBeUndefined();
  });

  test('return false when context not find to delete', () => {
    expect(ctxService.deleteContext('home')).toBeFalsy();
  });

  test('update the current context if present', () => {
    expect(ctxService.updateCurrent('check')).toBeTruthy();
  });

  test('return false if context is not present', () => {
    expect(ctxService.updateCurrent('home')).toBeFalsy();
  });
});
