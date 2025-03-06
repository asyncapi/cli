/* eslint-disable sonarjs/no-identical-functions */

import * as path from 'path';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';
import { NO_CONTEXTS_SAVED } from '../../src/core/errors/context-error';

const testHelper = new TestHelper();

describe('validate', () => {
  before(() => {
    createMockServer();
  });

  after(() => {
    stopMockServer();
  });

  describe('with file paths', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand(['validate', './test/fixtures/specification.yml']);
      expect(stdout).to.contain('File ./test/fixtures/specification.yml is valid but has (itself and/or referenced documents) governance issues.\n');
      expect(stderr).to.equal('');
    });

    it('works when file path is passed and schema is avro', async () => {
      const { stdout, stderr } = await runCommand(['validate', './test/fixtures/specification-avro.yml']);
      expect(stdout).to.contain('File ./test/fixtures/specification-avro.yml is valid but has (itself and/or referenced documents) governance issues.\n');
      expect(stderr).to.equal('');
    });

    it('should throw error if file path is wrong', async () => {
      const { stdout, stderr } = await runCommand(['validate', './test/fixtures/not-found.yml']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('error loading AsyncAPI document from file: ./test/fixtures/not-found.yml file does not exist.\n');
    });

    it('works when url is passed', async () => {
      const { stdout, stderr } = await runCommand(['validate', 'http://localhost:8080/dummySpec.yml']);
      expect(stdout).to.contain('URL http://localhost:8080/dummySpec.yml is valid but has (itself and/or referenced documents) governance issues.\n');
      expect(stderr).to.equal('');
    });

    it('should throw error when url is passed with proxyHost and proxyPort with invalid host', async () => {
      const { stdout, stderr } = await runCommand(['validate', 'http://localhost:8080/dummySpec.yml', '--proxyHost=host', '--proxyPort=8080']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('error loading AsyncAPI document from url: Failed to download http://localhost:8080/dummySpec.yml --proxyHost=host --proxyPort=8080.\n');
    });

    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand(['validate', './test/fixtures/valid-specification-latest.yml']);
      expect(stdout).to.include('File ./test/fixtures/valid-specification-latest.yml is valid! File ./test/fixtures/valid-specification-latest.yml and referenced documents don\'t have governance issues.');
      expect(stderr).to.equal('');
    });
  });

  describe('with context names', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('validates if context name exists', async () => {
      const fileName = path.resolve(__dirname, '../fixtures/specification.yml');
      const { stdout, stderr } = await runCommand(['validate', 'code']);
      expect(stdout).to.include(`File ${fileName} is valid but has (itself and/or referenced documents) governance issues.`);
      expect(stderr).to.equal('');
    });

    it('throws error if context name is not saved', async () => {
      const { stdout, stderr } = await runCommand(['validate', 'non-existing-context']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('ContextError: Context "non-existing-context" does not exist.\n');
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

    it('validates from current context', async () => {
      const fileName = path.resolve(__dirname, '../../test/fixtures/specification.yml');
      const { stdout, stderr } = await runCommand(['validate']);
      expect(stdout).to.includes(`File ${fileName} is valid but has (itself and/or referenced documents) governance issues`);
      expect(stderr).to.equal('');
    });

    it('throws error message if no current context', async () => {
      testHelper.unsetCurrentContext();
      testHelper.createDummyContextFile();
      const { stdout, stderr } = await runCommand(['validate']);
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
      const { stdout, stderr } = await runCommand(['validate']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal(`error locating AsyncAPI document: ${NO_CONTEXTS_SAVED}\n`);
    });
  });

  describe('with --log-diagnostics flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('works with --log-diagnostics', async () => {
      const { stdout, stderr } = await runCommand(['validate', './test/fixtures/specification.yml', '--log-diagnostics']);
      expect(stdout).to.contain('File ./test/fixtures/specification.yml is valid but has (itself and/or referenced documents) governance issues.\n');
      expect(stderr).to.equal('');
    });

    it('works with --no-log-diagnostics', async () => {
      const { stdout, stderr } = await runCommand(['validate', './test/fixtures/specification.yml', '--no-log-diagnostics']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('');
    });
  });

  describe('with --diagnostics-format flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('works with --diagnostics-format flag (with governance issues)', async () => {
      const { stdout, stderr } = await runCommand(['validate', './test/fixtures/specification.yml', '--diagnostics-format=text']);
      expect(stdout).to.match(new RegExp('File ./test/fixtures/specification.yml is valid but has \\(itself and\\/or referenced documents\\) governance issues.\\ntest\\/fixtures\\/specification.yml:1:1'));
      expect(stderr).to.equal('');
    });

    it('works with --diagnostics-format flag (without governance issues)', async () => {
      const { stdout, stderr } = await runCommand(['validate', './test/fixtures/valid-specification-latest.yml', '--diagnostics-format=text']);
      expect(stdout).to.include('\nFile ./test/fixtures/valid-specification-latest.yml is valid! File ./test/fixtures/valid-specification-latest.yml and referenced documents don\'t have governance issues.');
      expect(stderr).to.equal('');
    });
  });

  describe('with --fail-severity flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('works with --fail-severity', async () => {
      const { stdout, stderr } = await runCommand(['validate', './test/fixtures/specification.yml', '--fail-severity=warn']);
      expect(stderr).to.contain('File ./test/fixtures/specification.yml and/or referenced documents have governance issues.');
      expect(process.exitCode).to.equal(1);
    });
  });

  describe('with --score flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('works with --score flag', async () => {
      const { stdout, stderr } = await runCommand(['validate', './test/fixtures/asyncapiTestingScore.yml', '--score']);
      expect(stdout).to.contains('The score of the asyncapi document is 100\n');
      expect(stdout).to.contains('File ./test/fixtures/asyncapiTestingScore.yml is valid! File ./test/fixtures/asyncapiTestingScore.yml and referenced documents don\'t have governance issues.');
    });
  });
});
