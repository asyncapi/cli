import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';
import { NO_CONTEXTS_SAVED } from '../../src/core/errors/context-error';

const testHelper = new TestHelper();
const yamlFilePath = './test/fixtures/specification.yml';
const JSONFilePath = './test/fixtures/specification.json';
const convYmlFilePath = './test/fixtures/specification-conv.yml';
const convYamlFilePath = './test/fixtures/specification-conv.yaml';
const convJSONFilePath = './test/fixtures/specification-conv.json';

describe('format', () => {
  describe('with file paths', () => {
    before(() => {
      testHelper.createDummyContextFile();
      createMockServer();
    });

    after(() => {
      testHelper.deleteDummyContextFile();
      stopMockServer();
    });

    it('should log formatted content if no -o is passed', async () => {
      const { stdout, stderr } = await runCommand(['format', yamlFilePath, '-f', 'json']);
      expect(stdout).to.contain('succesfully logged after formatting to json ✅');
      expect(stderr).to.equals('');
    });

    it('should throw error if file path is wrong', async () => {
      const { stdout, stderr } = await runCommand(['format', './test/fixtures/not-found.yml', '-f', 'json']);
      expect(stdout).to.equals('');
      expect(stderr).to.equals('error loading AsyncAPI document from file: ./test/fixtures/not-found.yml file does not exist.\n');
    });

    it('works when url is passed', async () => {
      const { stdout, stderr } = await runCommand(['format', 'http://localhost:8080/dummySpec.yml', '-f', 'json']);
      expect(stdout).to.contain('succesfully logged after formatting to json ✅');
      expect(stderr).to.equals('');
    });
  });

  describe('with no arguments or required flags', () => {
    before(() => {
      testHelper.createDummyContextFile();
    });

    after(() => {
      testHelper.setCurrentContext('home');
      testHelper.deleteDummyContextFile();
    });

    it('should default to json without -f flag', async () => {
      const { stdout, stderr } = await runCommand(['format', yamlFilePath]);
      expect(stdout).to.contain('succesfully logged after formatting to json ✅');
      expect(stderr).to.equals('');
    });

    it('converts from current context', async () => {
      const { stdout, stderr } = await runCommand(['format', '-f', 'json']);
      expect(stdout).to.contain('succesfully logged after formatting to json ✅');
      expect(stderr).to.equals('');
    });

    it('throws error message if no current context', async () => {
      testHelper.unsetCurrentContext();
      testHelper.createDummyContextFile();
      const { stdout, stderr } = await runCommand(['format', '-f', 'json']);
      expect(stdout).to.equals('');
      expect(stderr).to.equals('ContextError: No context is set as current, please set a current context.\n');
    });
  });

  describe('with no spec file', () => {
    before(() => {
      try {
        testHelper.deleteDummyContextFile();
      } catch (e: any) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }
    });

    it('throws error message if no spec file exists', async () => {
      const { stdout, stderr } = await runCommand(['format', '-f', 'json']);
      expect(stdout).to.equals('');
      expect(stderr).to.equals(`error locating AsyncAPI document: ${NO_CONTEXTS_SAVED}\n`);
    });
  });

  describe('format with output flag', () => {
    before(() => {
      testHelper.createDummyContextFile();
    });

    after(() => {
      testHelper.deleteDummyContextFile();
    });

    it('create file yaml -> json', async () => {
      const { stdout, stderr } = await runCommand(['format', yamlFilePath, '-f', 'json', '-o', convJSONFilePath]);
      expect(stdout).to.contain(`succesfully formatted to json at ${convJSONFilePath} ✅`);
      expect(stderr).to.equals('');
    });

    it('create file json -> yaml', async () => {
      const { stdout, stderr } = await runCommand(['format', JSONFilePath, '-f', 'yaml', '-o', convYamlFilePath]);
      expect(stdout).to.contain(`succesfully formatted to yaml at ${convYamlFilePath} ✅`);
      expect(stderr).to.equals('');
    });

    it('create file json -> yml', async () => {
      const { stdout, stderr } = await runCommand(['format', JSONFilePath, '-f', 'yml', '-o', convYmlFilePath]);
      expect(stdout).to.contain(`succesfully formatted to yml at ${convYmlFilePath} ✅`);
      expect(stderr).to.equals('');
    });
  });

  describe('invalid or redundant format conversions', () => {
    it('yaml -> yaml', async () => {
      const { stdout, stderr } = await runCommand(['format', yamlFilePath, '-f', 'yaml']);
      expect(stderr).to.contain('Your document is already a YAML');
    });

    it('json -> json', async () => {
      const { stdout, stderr } = await runCommand(['format', JSONFilePath, '-f', 'json']);
      expect(stderr).to.contain('Your document is already a JSON');
    });
  });
});
