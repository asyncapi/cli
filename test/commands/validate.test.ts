/* eslint-disable sonarjs/no-identical-functions */

import path from 'path';
import { test } from '@oclif/test';

import { NO_CONTEXTS_SAVED } from '../../src/errors/context-error';
import TestHelper from '../testHelper';

const testHelper = new TestHelper();

describe('validate', () => {
  describe('with file paths', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });
    
    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/specification.yml'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toMatch('File ./test/specification.yml is valid but has (itself and/or referenced documents) governance issues.\n\ntest/specification.yml');
        expect(ctx.stderr).toEqual('');
        done();
      });
    
    test
      .stderr()
      .stdout()
      .command(['validate', './test/specification-avro.yml'])
      .it('works when file path is passed and schema is avro', (ctx, done) => {
        expect(ctx.stdout).toMatch(
          'File ./test/specification-avro.yml is valid but has (itself and/or referenced documents) governance issues.\n'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/not-found.yml'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual('error loading AsyncAPI document from file: ./test/not-found.yml file does not exist.\n');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', 'https://bit.ly/asyncapi'])
      .it('works when url is passed', (ctx, done) => {
        expect(ctx.stdout).toMatch('URL https://bit.ly/asyncapi is valid but has (itself and/or referenced documents) governance issues.\n\nhttps://bit.ly/asyncapi');
        expect(ctx.stderr).toEqual('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/valid-specification.yml'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toMatch('File ./test/valid-specification.yml is valid! File ./test/valid-specification.yml and referenced documents don\'t have governance issues.');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });
  
  describe('with context names', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });
    
    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });
  
    test
      .stderr()
      .stdout()
      .command(['validate', 'code'])
      .it('validates if context name exists', (ctx, done) => {
        const fileName = path.resolve(__dirname, '../specification.yml');
        expect(ctx.stdout).toMatch(`File ${fileName} is valid but has (itself and/or referenced documents) governance issues.`);
        expect(ctx.stderr).toEqual('');
        done();
      });
    
    test
      .stderr()
      .stdout()
      .command(['validate', 'non-existing-context'])
      .it('throws error if context name is not saved', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual('ContextError: Context "non-existing-context" does not exists.\n');
        done();
      });
  });
  
  describe('with no arguments', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.setCurrentContext('home');
      testHelper.deleteDummyContextFile();
    });
  
    test
      .stderr()
      .stdout()
      .command(['validate'])
      .it('validates from current context', (ctx, done) => {
        const fileName = path.resolve(__dirname, '../specification.yml');
        expect(ctx.stdout).toMatch(`File ${fileName} is valid but has (itself and/or referenced documents) governance issues`);
        expect(ctx.stderr).toEqual('');
        done();
      });
    
    test
      .stderr()
      .stdout()
      .do(() => {
        testHelper.unsetCurrentContext();
        testHelper.createDummyContextFile();
      })
      .command(['validate'])
      .it('throws error message if no current context', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual('ContextError: No context is set as current, please set a current context.\n');
        done();
      });
  });

  describe('with no context file', () => {
    beforeEach(() => {
      try {
        testHelper.deleteDummyContextFile();
      } catch (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }
    });
    
    test
      .stderr()
      .stdout()
      .command(['validate'])
      .it('throws error message if no context file exists', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual(`error locating AsyncAPI document: ${NO_CONTEXTS_SAVED}\n`);
        done();
      });
  });

  describe('with --log-diagnostics flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });
    
    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });
  
    test
      .stderr()
      .stdout()
      .command(['validate', './test/specification.yml', '--log-diagnostics'])
      .it('works with --log-diagnostics', (ctx, done) => {
        expect(ctx.stdout).toMatch('File ./test/specification.yml is valid but has (itself and/or referenced documents) governance issues.\n\ntest/specification.yml');
        expect(ctx.stderr).toEqual('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/specification.yml', '--no-log-diagnostics'])
      .it('works with --no-log-diagnostics', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('with --diagnostics-format flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });
    
    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });
  
    test
      .stderr()
      .stdout()
      .command(['validate', './test/specification.yml', '--diagnostics-format=text'])
      .it('works with --diagnostics-format flag (with governance issues)', (ctx, done) => {
        expect(ctx.stdout).toMatch('File ./test/specification.yml is valid but has (itself and/or referenced documents) governance issues.\ntest/specification.yml:1:1');
        expect(ctx.stderr).toEqual('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/valid-specification.yml', '--diagnostics-format=text'])
      .it('works with --diagnostics-format flag (without governance issues)', (ctx, done) => {
        expect(ctx.stdout).toMatch('File ./test/valid-specification.yml is valid! File ./test/valid-specification.yml and referenced documents don\'t have governance issues.');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('with --fail-severity flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });
    
    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });
  
    test
      .stderr()
      .stdout()
      .command(['validate', './test/specification.yml', '--fail-severity=warn'])
      .it('works with --fail-severity', (ctx, done) => {
        expect(ctx.stderr).toMatch('File ./test/specification.yml and/or referenced documents have governance issues.\n\ntest/specification.yml');
        done();
      });
  });
});
