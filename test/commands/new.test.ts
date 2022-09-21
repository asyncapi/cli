import { test } from '@oclif/test';

import Testhelper from '../testHelper';

const testHelper = new Testhelper();

describe('new', () => {
  afterEach(() => {
    testHelper.newCommandHelper().deleteSpecFile();
  });

  beforeEach(() => {
    testHelper.newCommandHelper().deleteSpecFile();
  });
  
  test
    .stderr()
    .stdout()
    .command(['new', '--no-tty', '-n=specification.yaml'])
    .it('runs new command', async (ctx,done) => {
      expect(ctx.stderr).toEqual('');
      expect(ctx.stdout).toEqual('Created file specification.yaml...\n');
      done();
    });
});
