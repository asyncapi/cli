import path from 'path';
import { test } from '@oclif/test';

import TestHelper from '../testHelper';
import { CONTEXT_FILE_PATH } from '../../src/models/Context';

const testHelper = new TestHelper();

// Both Jest's method names `test` and `it` are utilized by `@oclif/test`, so
// using them again results in error `Tests cannot be nested`, preventing
// creation of clear block structure of Jest's tests.
// Due to this `beforeEach()` cannot be used, because borders of each test
// cannot be recognized, so workarounds with explicit calls of `TestHelper`
// methods inside of `describe`s had to be implemented.

describe('config:context, positive scenario', () => {
  beforeAll(() => {
    testHelper.createDummyContextFile();
  });

  afterAll(() => {
    testHelper.deleteDummyContextFile();
  });

  describe('config:context:current', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:current'])
      .it('should show current context', (ctx, done) => {
        expect(ctx.stdout).toEqual(
          `${testHelper.context.current}: ${testHelper.context.store['home']}\n`
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('config:context:list', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:list'])
      .it(
        'should list contexts prints list if context file is present',
        (ctx, done) => {
          expect(ctx.stdout).toEqual(
            `home: ${path.resolve(
              __dirname,
              '../specification.yml'
            )}\ncode: ${path.resolve(__dirname, '../specification.yml')}\n`
          );
          expect(ctx.stderr).toEqual('');
          done();
        }
      );
  });

  describe('config:context:add', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:add', 'test', './test/specification.yml'])
      .it('should add new context called "test"', (ctx, done) => {
        expect(ctx.stdout).toEqual(
          'Added context "test".\n\nYou can set it as your current context: asyncapi config context use test\nYou can use this context when needed by passing test as a parameter: asyncapi validate test\n'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('config:context:add', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:add', 'test', './test/specification.yml'])
      .it(
        'should NOT add new context with already existing in context file name "test"',
        (ctx, done) => {
          expect(ctx.stdout).toEqual('');
          expect(ctx.stderr).toEqual(
            `ContextError: Context with name "test" already exists in context file "${CONTEXT_FILE_PATH}".\n`
          );
          done();
        }
      );
  });

  describe('config:context:edit', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:edit', 'test', './test/specification2.yml'])
      .it('should edit existing context "test"', (ctx, done) => {
        expect(ctx.stdout).toContain('Edited context "test".');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('config:context:use', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:use', 'code'])
      .it('should update the current context', (ctx, done) => {
        expect(ctx.stdout).toEqual('code is set as current\n');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  // On direct execution of `chmodSync(CONTEXT_FILE_PATH, '444')` context file's
  // permissions get changed to 'read only' in file system, but `@oclif/test`'s
  // test still passes. Thus there is no sense in implementation of
  // `writeFile()` faulty scenario with `@oclif/test` framework.
  describe('config:context:remove', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:remove', 'code'])
      .it('should remove existing context', (ctx, done) => {
        expect(ctx.stdout).toEqual('code successfully deleted\n');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });
  
  describe('config:context:init', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:init'])
      .it('should initialize new empty context file without a switch', (ctx, done) => {
        expect(ctx.stdout).toContain('Initialized context');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('config:context:init', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:init', '.'])
      .it('should initialize new empty context file with switch "."', (ctx, done) => {
        expect(ctx.stdout).toContain('Initialized context');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('config:context:init', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:init', './'])
      .it('should initialize new empty context file with switch "./"', (ctx, done) => {
        expect(ctx.stdout).toContain('Initialized context');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('config:context:init', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:init', '~'])
      .it('should initialize new empty context file with switch "~"', (ctx, done) => {
        expect(ctx.stdout).toContain('Initialized context');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });
});

describe('config:context, negative scenario', () => {
  beforeAll(() => {
    // Any context file needs to be created before starting test suite,
    // otherwise a totally legitimate context file will be created automatically
    // by `addContext()`.
    testHelper.createDummyContextFileWrong('');
  });

  afterAll(() => {
    testHelper.deleteDummyContextFile();
  });

  describe('config:context:add', () => {
    testHelper.deleteDummyContextFile();
    testHelper.createDummyContextFileWrong('');
    test
      .stderr()
      .stdout()
      .command(['config:context:add', 'home', './test/specification.yml'])
      .it(
        'should throw error on zero-sized file saying that context file has wrong format.',
        (ctx, done) => {
          expect(ctx.stdout).toEqual('');
          expect(ctx.stderr).toContain(
            `ContextError: Context file "${CONTEXT_FILE_PATH}" has wrong format.`
          );
          done();
        }
      );
  });

  describe('config:context:add', () => {
    testHelper.deleteDummyContextFile();
    testHelper.createDummyContextFileWrong('{}');
    test
      .stderr()
      .stdout()
      .command(['config:context:add', 'home', './test/specification.yml'])
      .it(
        'should throw error on file with empty object saying that context file has wrong format.',
        (ctx, done) => {
          expect(ctx.stdout).toEqual('');
          expect(ctx.stderr).toContain(
            `ContextError: Context file "${CONTEXT_FILE_PATH}" has wrong format.`
          );
          done();
        }
      );
  });

  describe('config:context:add', () => {
    testHelper.deleteDummyContextFile();
    testHelper.createDummyContextFileWrong('[]');
    test
      .stderr()
      .stdout()
      .command(['config:context:add', 'home', './test/specification.yml'])
      .it(
        'should throw error on file with empty array saying that context file has wrong format.',
        (ctx, done) => {
          expect(ctx.stdout).toEqual('');
          expect(ctx.stderr).toContain(
            `ContextError: Context file "${CONTEXT_FILE_PATH}" has wrong format.`
          );
          done();
        }
      );
  });

  // Totally correct (and considered correct by `@oclif/core`) format of the
  // context file
  // `{"current":"home","store":{"home":"homeSpecFile","code":"codeSpecFile"}}`
  // is considered wrong in `@oclif/test`, limiting possibilities of negative
  // scenarios coding.
  describe('config:context:add', () => {
    testHelper.deleteDummyContextFile();
    testHelper.createDummyContextFileWrong(
      '{"current":"home","current2":"test","store":{"home":"homeSpecFile","code":"codeSpecFile"}}'
    );
    test
      .stderr()
      .stdout()
      .command(['config:context:add', 'home', './test/specification.yml'])
      .it(
        'should throw error on file with object having three root properties, saying that context file has wrong format.',
        (ctx, done) => {
          expect(ctx.stdout).toEqual('');
          expect(ctx.stderr).toContain(
            `ContextError: Context file "${CONTEXT_FILE_PATH}" has wrong format.`
          );
          done();
        }
      );
  });
});

describe('config:context, negative scenario', () => {
  afterAll(() => {
    testHelper.deleteDummyContextFile();
  });

  describe('config:context:list', () => {
    testHelper.deleteDummyContextFile();
    test
      .stderr()
      .stdout()
      .command(['config:context:list'])
      .it(
        'should output info message (to stdout, NOT stderr) about absence of context file.',
        (ctx, done) => {
          expect(ctx.stdout).toContain('You have no context file configured.');
          expect(ctx.stderr).toEqual('');
          done();
        }
      );
  });
});
