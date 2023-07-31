import { test } from '@oclif/test';
import TestHelper from '../../../helpers';

const testHelper = new TestHelper();

describe('new', () => {
  beforeAll(() => {
    try {
      testHelper.newCommandHelper().deleteSpecFile();
    } catch (e) {
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
  });

  describe('create new file', () => {
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

  describe('when asyncapi file already exists', () => {
    beforeEach(() => {
      try {
        testHelper.createSpecFileAtWorkingDir();
      } catch (e) {
        if (e.code !== 'EEXIST') {
          throw e;
        }
      }
    });

    afterEach(() => {
      testHelper.newCommandHelper().deleteSpecFile();
    });

    test
      .stderr()
      .stdout()
      .command(['new:file', '--no-tty', '-n=specification.yaml'])
      .it('should inform about the existing file and finish the process', async (ctx,done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toEqual('File specification.yaml already exists. Ignoring...\n');
        done();
      });
  });
});
