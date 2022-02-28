import { expect, test } from '@oclif/test';

import Testhelper from '../testHelper';

const testHelper = new Testhelper();

describe('new', () => {
  beforeEach(() => {
    testHelper.newCommandHelper().deleteSpecFile();
  });
  afterEach(() => {
    testHelper.newCommandHelper().deleteSpecFile();
  });
  test
    .stderr()
    .stdout()
    .command(['new', '--no-tty', '-n=specification.yaml'])
    .it('runs new command', async (ctx,done) => {
      expect(ctx.stderr).to.equals('');
      expect(ctx.stdout).to.equals('Created file specification.yaml...\n');
      done();
    });
});
