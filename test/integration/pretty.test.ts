import * as path from 'path';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';

const testHelper = new TestHelper();
const badFormatPath = './test/fixtures/asyncapi_v1.yml';
const validFormatPath = './test/fixtures/asyncapiValid_v1.yml';
const badFormatPathJson = './test/fixtures/badFormatAsyncapi.json';

describe('pretty', () => {
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

    it('should log the information file has been beautified', async () => {
      const { stdout, stderr } = await runCommand(['pretty', badFormatPath]);
      expect(stdout).to.contain(`Asyncapi document ${badFormatPath} has been beautified in-place`);
      expect(stderr).to.equal('');
    });

    it('should log the information file has been beautified with output path', async () => {
      const { stdout, stderr } = await runCommand(['pretty', badFormatPath, '-o', validFormatPath]);
      expect(stdout).to.contain(`Asyncapi document has been beautified ${validFormatPath}`);
      expect(stderr).to.equal('');
    });

    it('should log the information file has been beautified json file', async () => {
      const { stdout, stderr } = await runCommand(['pretty', badFormatPathJson]);
      expect(stdout).to.contain(`Asyncapi document ${badFormatPathJson} has been beautified in-place`);
      expect(stderr).to.equal('');
    });
  });
});
