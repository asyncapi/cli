import * as path from 'path';
import { expect, test } from '@oclif/test';
import { NO_CONTEXTS_SAVED } from '../../src/errors/context-error';
import TestHelper from '../testHelper';

const testHelper = new TestHelper();
const filePath = './test/specification.yml';

describe('convert', () => {
  describe('with file paths', () => {
    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['convert', filePath])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.include('File ./test/specification.yml successfully converted!\n');
        expect(ctx.stderr).to.equals('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', './test/not-found.yml'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).to.equals('');
        expect(ctx.stderr).to.equals('error loading AsyncAPI document from file: ./test/not-found.yml file does not exist.\n');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', 'https://bit.ly/asyncapi'])
      .it('works when url is passed', (ctx, done) => {
        expect(ctx.stdout).to.include('URL https://bit.ly/asyncapi successfully converted!\n');
        expect(ctx.stderr).to.equals('');
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
      .command(['convert'])
      .it('converts from current context', (ctx, done) => {
        expect(ctx.stdout).to.include(`File ${path.resolve(__dirname, '../specification.yml')} successfully converted!\n`);
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
      .command(['convert'])
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
      .command(['convert'])
      .it('throws error message if no context file exists', (ctx, done) => {
        expect(ctx.stdout).to.equals('');
        expect(ctx.stderr).to.equals(`error locating AsyncAPI document: ${NO_CONTEXTS_SAVED}\n`);
        done();
      });
  });

  describe('with target-version flag', () => {
    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['convert', filePath, '-t=2.3.0'])
      .it('works when supported target-version is passed', (ctx, done) => {
        expect(ctx.stdout).to.include('asyncapi: 2.3.0');
        expect(ctx.stderr).to.equals('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', filePath, '-t=2.95.0'])
      .it('should throw error if non-supported target-version is passed', (ctx, done) => {
        expect(ctx.stdout).to.equals('');
        expect(ctx.stderr).to.include('Error: Cannot convert');
        done();
      });
  });
}); 
