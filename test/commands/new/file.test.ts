import { test } from '@oclif/test';
import TestHelper from '../../testHelper';

const testHelper = new TestHelper();

describe('new', () => {
  describe('create new file', () => {
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
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toEqual('Created file specification.yaml...\n');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['new:file', '--no-tty', '-n=specification.yaml'])
      .it('runs new file command', async (ctx,done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toEqual('Created file specification.yaml...\n');
        done();
      });
  });
});
