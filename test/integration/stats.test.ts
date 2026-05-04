import { test, expect } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../helpers/index';

const testHelper = new TestHelper();
const validSpecFile = './test/fixtures/specification.yml';

describe('stats', () => {
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
    .command(['stats', validSpecFile])
    .it('displays statistics for a valid spec file', (ctx) => {
      expect(ctx.stdout).to.contain('📊 AsyncAPI Document Statistics');
      expect(ctx.stdout).to.contain('Channels:');
      expect(ctx.stdout).to.contain('Operations:');
      expect(ctx.stdout).to.contain('Messages:');
      expect(ctx.stderr).to.equal('');
    });

  test
    .stderr()
    .stdout()
    .command(['stats', './test/fixtures/not-found.yml'])
    .it('throws error if file path is wrong', (ctx) => {
      expect(ctx.stderr).to.contain('ValidationError');
    });

  test
    .stderr()
    .stdout()
    .command(['stats', validSpecFile])
    .it('shows title and version', (ctx) => {
      expect(ctx.stdout).to.contain('Title:');
      expect(ctx.stdout).to.contain('Version:');
      expect(ctx.stdout).to.contain('AsyncAPI:');
    });
});
