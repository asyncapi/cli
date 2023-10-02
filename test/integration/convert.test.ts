import path from 'path';
import { test } from '@oclif/test';
import { NO_CONTEXTS_SAVED } from '../../src/errors/context-error';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';
import fs from 'fs-extra';
import { expect } from '@oclif/test';

const testHelper = new TestHelper();
const filePath = './test/fixtures/specification.yml';
const JSONFilePath = './test/fixtures/specification.json';

describe('convert', () => {
  describe('with file paths', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    before(() => {
      createMockServer();
    });

    after(() => {
      stopMockServer();
    });

    test
      .stderr()
      .stdout()
      .command(['convert', filePath])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.contain('File ./test/fixtures/specification.yml successfully converted!\n');
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', './test/fixtures/not-found.yml'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal('error loading AsyncAPI document from file: ./test/fixtures/not-found.yml file does not exist.\n');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', 'http://localhost:8080/dummySpec.yml'])
      .it('works when url is passed', (ctx, done) => {
        expect(ctx.stdout).to.contain('URL http://localhost:8080/dummySpec.yml successfully converted!\n');
        expect(ctx.stderr).to.equal('');
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
        expect(ctx.stdout).to.contain(`File ${path.resolve(__dirname, '../fixtures/specification.yml')} successfully converted!\n`);
        expect(ctx.stderr).to.equal('');
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
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal('ContextError: No context is set as current, please set a current context.\n');
        done();
      });
  });

  describe('with no context file', () => {
    beforeEach(() => {
      try {
        testHelper.deleteDummyContextFile();
      } catch (e: any) {
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
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal(`error locating AsyncAPI document: ${NO_CONTEXTS_SAVED}\n`);
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
        expect(ctx.stdout).to.contain('asyncapi: 2.3.0');
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', filePath, '-t=2.95.0'])
      .it('should throw error if non-supported target-version is passed', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.contain('Error: Cannot convert');
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
      .command(['convert', filePath, '-o=./test/fixtures/specification_output.yml'])
      .it('works when .yml file is passed', (ctx, done) => {
        expect(ctx.stdout).to.equal(`File ${filePath} successfully converted!\n`);
        expect(fs.existsSync('./test/fixtures/specification_output.yml')).to.equal(true);
        expect(ctx.stderr).to.equal('');
        fs.unlinkSync('./test/fixtures/specification_output.yml');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['convert', JSONFilePath, '-o=./test/fixtures/specification_output.json'])
      .it('works when .json file is passed', (ctx, done) => {
        expect(ctx.stdout).to.equal(`File ${JSONFilePath} successfully converted!\n`);
        expect(fs.existsSync('./test/fixtures/specification_output.json')).to.equal(true);
        expect(ctx.stderr).to.equal('');
        fs.unlinkSync('./test/fixtures/specification_output.json');
        done();
      });
  });
});
