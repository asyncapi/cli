import path from 'path';
import { test } from '@oclif/test';

import { NO_CONTEXTS_SAVED } from '../../src/errors/context-error';
import TestHelper from '../testHelper';
import fs from 'fs-extra';
import { unlink, unlinkSync } from 'fs';

const testHelper = new TestHelper();
const filePath = './test/specification.yml';
const JSONFilePath = './test/specification.json';

describe('convert', () => {
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
      .command(['convert', filePath])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toContain('File ./test/specification.yml successfully converted!\n');
        expect(ctx.stderr).toEqual('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', './test/not-found.yml'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual('error loading AsyncAPI document from file: ./test/not-found.yml file does not exist.\n');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', 'https://bit.ly/asyncapi'])
      .it('works when url is passed', (ctx, done) => {
        expect(ctx.stdout).toContain('URL https://bit.ly/asyncapi successfully converted!\n');
        expect(ctx.stderr).toEqual('');
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
      .command(['convert'])
      .it('converts from current context', (ctx, done) => {
        expect(ctx.stdout).toContain(`File ${path.resolve(__dirname, '../specification.yml')} successfully converted!\n`);
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
      .command(['convert'])
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
      .command(['convert'])
      .it('throws error message if no context file exists', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual(`error locating AsyncAPI document: ${NO_CONTEXTS_SAVED}\n`);
        done();
      });
  });

  describe('with target-version flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['convert', filePath, '-t=2.3.0'])
      .it('works when supported target-version is passed', (ctx, done) => {
        expect(ctx.stdout).toContain('asyncapi: 2.3.0');
        expect(ctx.stderr).toEqual('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', filePath, '-t=2.95.0'])
      .it('should throw error if non-supported target-version is passed', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toContain('Error: Cannot convert');
        done();
      });
  });

  describe('with output flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['convert', filePath, '-o=./test/specification_output.yml'])
      .it('works when .yml file is passed', (ctx, done) => {
        expect(ctx.stdout).toEqual(`File ${filePath} successfully converted!\n`);
        expect(fs.existsSync('./test/specification_output.yml')).toBe(true);
        expect(ctx.stderr).toEqual('');
        fs.unlinkSync('./test/specification_output.yml');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', JSONFilePath, '-o=./test/specification_output.json'])
      .it('works when .json file is passed', (ctx, done) => {
        expect(ctx.stdout).toEqual(`File ${JSONFilePath} successfully converted!\n`);
        expect(fs.existsSync('./test/specification_output.json')).toBe(true);
        expect(ctx.stderr).toEqual('');
        fs.unlinkSync('./test/specification_output.json');
        done();
      });
  });
}); 
