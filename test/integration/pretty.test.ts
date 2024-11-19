import { test } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';
import { expect } from '@oclif/test';

const testHelper = new TestHelper();
const badFormatPath = './test/fixtures/asyncapi_v1.yml';

describe('pretty', () => {
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
      .command(['pretty', badFormatPath])
      .it('should log the information file has been beautified', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          `Asyncapi document ${badFormatPath} has been beautified in-place`,
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });
});
