import { test } from '@oclif/test';
import fs from 'fs';
import TestHelper from '../helpers';
import { expect } from 'chai';

const testHelper = new TestHelper();
const bundledFilePath = './asyncapi-bundled.yml';

describe('start preview', () => {
  beforeEach(() => {
    testHelper.createDummyContextFile();
  });

  afterEach(() => {
    testHelper.deleteDummyContextFile();
    if (fs.existsSync(bundledFilePath)) {
      fs.unlinkSync(bundledFilePath);
    }
  });

  test
    .stderr()
    .stdout()
    .command(['start:preview', './test/fixtures/specification.yml'])
    .it('bundles the AsyncAPI file and starts the studio', ({ stdout, stderr }) => {
      const output = stdout + stderr;
      expect(output).to.include('Starting Studio in preview mode...');
      expect(output).to.include('Bundled file updated successfully.');
      expect(fs.existsSync(bundledFilePath)).to.be.true;
    });

  test
    .stderr()
    .stdout()
    .command(['start:preview', 'non-existing-context'])
    .it('throws error if context does not exist', ({ stdout, stderr }) => {
      const output = stdout + stderr;
      expect(output).to.include('ContextError: Context "non-existing-context" does not exist');
    });
});
