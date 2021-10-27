/* eslint-disable sonarjs/no-identical-functions */

import * as path from 'path';
import { expect, test } from '@oclif/test';

import TestHelper from '../testHelper';

const testHelper = new TestHelper();

describe('validate', () => {
  describe('with file paths', () => {
    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });
  
    test
      .stderr()
      .stdout()
      .command(['validate', './test/specification.yml'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.equals(
          'File ./test/specification.yml successfully validated!\n'
        );
        expect(ctx.stderr).to.equals('');
        done();
      });
    
    test
      .stderr()
      .stdout()
      .command(['validate', './test/not-found.yml'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).to.equals('');
        expect(ctx.stderr).to.equals('ValidationError: There is no file or context with name "./test/not-found.yml".\n');
        done();
      });
  });
  
  describe('with context names', () => {
    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    beforeEach(() => {
      testHelper.createDummyContextFile();
    });
  
    test
      .stderr()
      .stdout()
      .command(['validate', 'code'])
      .it('validates if context name exists', (ctx, done) => {
        expect(ctx.stdout).to.equals(
          `File ${path.resolve(__dirname, '../specification.yml')} successfully validated!\n`
        );
        expect(ctx.stderr).to.equals('');
        done();
      });
    
    test
      .stderr()
      .stdout()
      .command(['validate', 'non-existing-context'])
      .it('throws error if context name is not saved', (ctx, done) => {
        expect(ctx.stdout).to.equals('');
        expect(ctx.stderr).to.equals('ContextError: Context "non-existing-context" does not exists.\n');
        done();
      });
  });
  
  describe('with no arguments', () => {
    afterEach(() => {
      testHelper.setCurrentContext('home');
      testHelper.deleteDummyContextFile();
    });

    beforeEach(() => {
      testHelper.createDummyContextFile();
    });
  
    test
      .stderr()
      .stdout()
      .command(['validate'])
      .it('validates from current context', (ctx, done) => {
        expect(ctx.stdout).to.equals(
          `File ${path.resolve(__dirname, '../specification.yml')} successfully validated!\n`
        );
        expect(ctx.stderr).to.equals('');
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
        expect(ctx.stdout).to.equals('');
        expect(ctx.stderr).to.equals('ContextError: No context is set as current, please set a current context.\n');
        done();
      });
    
    test
      .stderr()
      .stdout()
      .do(() => {
        testHelper.deleteDummyContextFile();
      })
      .command(['validate'])
      .it('throws error message if no context file exists', (ctx, done) => {
        expect(ctx.stdout).to.equals('');
        expect(ctx.stderr).to.equals('ContextError: No contexts saved yet, run asyncapi --help to learn more\n');
        done();
      });
  });
});
