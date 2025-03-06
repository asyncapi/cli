import * as path from 'path';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';
import fs from 'fs-extra';
import { NO_CONTEXTS_SAVED } from '../../src/core/errors/context-error';

const testHelper = new TestHelper();
const filePath = './test/fixtures/specification.yml';
const JSONFilePath = './test/fixtures/specification.json';
const openAPIFilePath = './test/fixtures/openapi.yml';
const postmanFilePath = './test/fixtures/postman-collection.yml';

describe('convert', () => {
  describe('with file paths', () => {
    before(() => {
      testHelper.createDummyContextFile();
      createMockServer();
    });

    after(() => {
      testHelper.deleteDummyContextFile();
      stopMockServer();
    });

    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand(['convert', filePath]);
      expect(stdout).to.contain('The ./test/fixtures/specification.yml file has been successfully converted to version 3.0.0!!');
      expect(stderr).to.equal('');
    });

    it('should throw error if file path is wrong', async () => {
      const { stdout, stderr } = await runCommand(['convert', './test/fixtures/not-found.yml']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('error loading AsyncAPI document from file: ./test/fixtures/not-found.yml file does not exist.\n');
    });

    it('works when url is passed', async () => {
      const { stdout, stderr } = await runCommand(['convert', 'http://localhost:8080/dummySpec.yml']);
      expect(stdout).to.contain('The URL http://localhost:8080/dummySpec.yml has been successfully converted to version 3.0.0!!');
      expect(stderr).to.equal('');
    });

    it('should throw error when url is passed with proxyHost and proxyPort with invalid host', async () => {
      const { stdout, stderr } = await runCommand(['convert', 'http://localhost:8080/dummySpec.yml', '--proxyHost=host', '--proxyPort=8080']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('error loading AsyncAPI document from url: Failed to download http://localhost:8080/dummySpec.yml --proxyHost=host --proxyPort=8080.\n');
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

    it('converts from current context', async () => {
      const { stdout, stderr } = await runCommand(['convert']);
      expect(stdout).to.contain(`The ${path.resolve(__dirname, '../fixtures/specification.yml')} file has been successfully converted to version 3.0.0!!\n`);
      expect(stderr).to.equal('');
    });

    it('throws error message if no current context', async () => {
      testHelper.unsetCurrentContext();
      testHelper.createDummyContextFile();
      const { stdout, stderr } = await runCommand(['convert', '-f', 'asyncapi']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('ContextError: No context is set as current, please set a current context.\n');
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

    it('throws error message if no context file exists', async () => {
      const { stdout, stderr } = await runCommand(['convert', '-f', 'asyncapi']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal(`error locating AsyncAPI document: ${NO_CONTEXTS_SAVED}\n`);
    });
  });

  describe('with target-version flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('works when supported target-version is passed', async () => {
      const { stdout, stderr } = await runCommand(['convert', filePath, '-f', 'asyncapi', '-t=2.3.0']);
      expect(stdout).to.contain('asyncapi: 2.3.0');
      expect(stderr).to.equal('');
    });

    it('should throw error if non-supported target-version is passed', async () => {
      const { stdout, stderr } = await runCommand(['convert', filePath, '-f', 'asyncapi', '-t=2.95.0']);
      expect(stdout).to.equal('');
      expect(stderr).to.contain('Error: Cannot convert');
    });
  });

  describe('with output flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('works when .yml file is passed', async () => {
      const { stdout, stderr } = await runCommand(['convert', filePath, '-f', 'asyncapi', '-o=./test/fixtures/specification_output.yml']);
      expect(stdout).to.contain(`The ${filePath} file has been successfully converted to version 3.0.0!!`);
      expect(fs.existsSync('./test/fixtures/specification_output.yml')).to.equal(true);
      expect(stderr).to.equal('');
      fs.unlinkSync('./test/fixtures/specification_output.yml');
    });

    it('works when .json file is passed', async () => {
      const { stdout, stderr } = await runCommand(['convert', JSONFilePath, '-f', 'asyncapi', '-o=./test/fixtures/specification_output.json']);
      expect(stdout).to.contain(`The ${JSONFilePath} file has been successfully converted to version 3.0.0!!`);
      expect(fs.existsSync('./test/fixtures/specification_output.json')).to.equal(true);
      expect(stderr).to.equal('');
      fs.unlinkSync('./test/fixtures/specification_output.json');
    });
  });

  describe('with OpenAPI input', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('works when OpenAPI file path is passed', async () => {
      const { stdout, stderr } = await runCommand(['convert', openAPIFilePath, '-f', 'openapi']);
      expect(stdout).to.contain('The OpenAPI document has been successfully converted to AsyncAPI version 3.0.0!');
      expect(stderr).to.equal('');
    });

    it('works when OpenAPI file path is passed with client perspective', async () => {
      const { stdout, stderr } = await runCommand(['convert', openAPIFilePath, '-f', 'openapi', '-p=client']);
      expect(stdout).to.contain('The OpenAPI document has been successfully converted to AsyncAPI version 3.0.0!');
      expect(stderr).to.equal('');
    });

    it('works when OpenAPI file path is passed with server perspective', async () => {
      const { stdout, stderr } = await runCommand(['convert', openAPIFilePath, '-f', 'openapi', '-p=server']);
      expect(stdout).to.contain('The OpenAPI document has been successfully converted to AsyncAPI version 3.0.0!');
      expect(stderr).to.equal('');
    });

    it('should throw error if invalid perspective is passed', async () => {
      const { stdout, stderr } = await runCommand(['convert', openAPIFilePath, '-f', 'openapi', '-p=invalid']);
      expect(stdout).to.equal('');
      expect(stderr).to.contain('Error: Expected --perspective=invalid to be one of: client, server');
    });

    it('works when OpenAPI file is converted and output is saved', async () => {
      const { stdout, stderr } = await runCommand(['convert', openAPIFilePath, '-f', 'openapi', '-o=./test/fixtures/openapi_converted_output.yml']);
      expect(stdout).to.contain('🎉 The OpenAPI document has been successfully converted to AsyncAPI version 3.0.0!');
      expect(fs.existsSync('./test/fixtures/openapi_converted_output.yml')).to.equal(true);
      expect(stderr).to.equal('');
      fs.unlinkSync('./test/fixtures/openapi_converted_output.yml');
    });
  });

  describe('with Postman input', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('works when Postman file path is passed', async () => {
      const { stdout, stderr } = await runCommand(['convert', postmanFilePath, '-f', 'postman-collection']);
      expect(stdout).to.contain(`🎉 The ${postmanFilePath} file has been successfully converted to asyncapi of version 3.0.0!!`);
      expect(stderr).to.equal('');
    });

    it('works when Postman file path is passed with client perspective', async () => {
      const { stdout, stderr } = await runCommand(['convert', postmanFilePath, '-f', 'postman-collection', '-p=client']);
      expect(stdout).to.contain(`🎉 The ${postmanFilePath} file has been successfully converted to asyncapi of version 3.0.0!!`);
      expect(stderr).to.equal('');
    });

    it('works when Postman file path is passed with server perspective', async () => {
      const { stdout, stderr } = await runCommand(['convert', postmanFilePath, '-f', 'postman-collection', '-p=server']);
      expect(stdout).to.contain(`🎉 The ${postmanFilePath} file has been successfully converted to asyncapi of version 3.0.0!!`);
      expect(stderr).to.equal('');
    });

    it('should throw error if invalid perspective is passed', async () => {
      const { stdout, stderr } = await runCommand(['convert', postmanFilePath, '-f', 'postman-collection', '-p=invalid']);
      expect(stdout).to.equal('');
      expect(stderr).to.contain('Error: Expected --perspective=invalid to be one of: client, server');
    });

    it('works when Postman file is converted and output is saved', async () => {
      const { stdout, stderr } = await runCommand(['convert', postmanFilePath, '-f', 'postman-collection', '-o=./test/fixtures/postman_converted_output.yml']);
      expect(stdout).to.contain(`🎉 The ${postmanFilePath} file has been successfully converted to asyncapi of version 3.0.0!!`);
      expect(fs.existsSync('./test/fixtures/postman_converted_output.yml')).to.equal(true);
      expect(stderr).to.equal('');
      fs.unlinkSync('./test/fixtures/postman_converted_output.yml');
    });
  });
});
