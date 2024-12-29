import { test } from '@oclif/test';
import { NO_CONTEXTS_SAVED } from '../../src/core/errors/context-error';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';
import { expect } from '@oclif/test';

const testHelper = new TestHelper();
const yamlFilePath = './test/fixtures/specification.yml';
const JSONFilePath = './test/fixtures/specification.json';
const convYmlFilePath = './test/fixtures/specification-conv.yml';
const convYamlFilePath = './test/fixtures/specification-conv.yaml';
const convJSONFilePath = './test/fixtures/specification-conv.json';

describe('format', () => {
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
      .command(['format', yamlFilePath, '-f', 'json'])
      .it('should log formatted content if no -o is passed', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          'succesfully logged after formatting to json ✅',
        );
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['format', './test/fixtures/not-found.yml', '-f', 'json'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal(
          'error loading AsyncAPI document from file: ./test/fixtures/not-found.yml file does not exist.\n',
        );
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['format', 'http://localhost:8080/dummySpec.yml', '-f', 'json'])
      .it('works when url is passed', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          'succesfully logged after formatting to json ✅',
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with no arguments or required flags', () => {
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
      .command(['format', yamlFilePath])
      .it('should default to json without -f flag', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          'succesfully logged after formatting to json ✅',
        );
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['format', '-f', 'json'])
      .it('converts from current context', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          'succesfully logged after formatting to json ✅',
        );
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
      .command(['format', '-f', 'json'])
      .it('throws error message if no current context', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal(
          'ContextError: No context is set as current, please set a current context.\n',
        );
        done();
      });
  });

  describe('with no spec file', () => {
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
      .command(['format', '-f', 'json'])
      .it('throws error message if no spec file exists', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal(
          `error locating AsyncAPI document: ${NO_CONTEXTS_SAVED}\n`,
        );
        done();
      });
  });

  describe('format with output flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['format', yamlFilePath, '-f', 'json', '-o', convJSONFilePath])
      .it('create file yaml -> json', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          `succesfully formatted to json at ${convJSONFilePath} ✅`,
        );
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['format', JSONFilePath, '-f', 'yaml', '-o', convYamlFilePath])
      .it('create file json -> yaml', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          `succesfully formatted to yaml at ${convYamlFilePath} ✅`,
        );
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['format', JSONFilePath, '-f', 'yml', '-o', convYmlFilePath])
      .it('create file json -> yml', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          `succesfully formatted to yml at ${convYmlFilePath} ✅`,
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('invalid or redundant format conversions', () => {
    test
      .stderr()
      .stdout()
      .command(['format', yamlFilePath, '-f', 'yaml'])
      .it('yaml -> yaml', (ctx, done) => {
        expect(ctx.stderr).to.contain('Your document is already a YAML');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['format', JSONFilePath, '-f', 'json'])
      .it('json -> json', (ctx, done) => {
        expect(ctx.stderr).to.contain('Your document is already a JSON');
        done();
      });
  });
});
