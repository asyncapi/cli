/* eslint-disable sonarjs/no-identical-functions */

import { test } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';

const testHelper = new TestHelper();

describe('evaluate', () => {
  describe('with file paths', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
      createMockServer();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
      stopMockServer();
    });``

    test
      .stderr()
      .stdout()
      .command(['evaluate', './test/fixtures/evaluateTemplate/asyncapi.yml'])
      .it('works when file path is passed', (ctx, done) => {
        console.log(ctx)
        
        done()
      });

  
  });
});
