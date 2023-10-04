import { test } from '@oclif/test';
import TestHelper from '../../helpers';
import { expect } from '@oclif/test';

const testHelper = new TestHelper();

describe('new', () => {
  before(() => {
    try {
      testHelper.newCommandHelper().deleteSpecFile();
    } catch (e: any) {
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
        expect(ctx.stderr).to.equal('');
        expect(ctx.stdout).to.equal('Created file specification.yaml...\n');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['new:file', '--no-tty', '-n=specification.yaml'])
      .it('runs new file command', async (ctx,done) => {
        expect(ctx.stderr).to.equal('');
        expect(ctx.stdout).to.equal('Created file specification.yaml...\n');
        done();
      });
  });

  describe('when asyncapi file already exists', () => {
    beforeEach(() => {
      try {
        testHelper.createSpecFileAtWorkingDir();
      } catch (e: any) {
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
        expect(ctx.stderr).to.equal('');
        expect(ctx.stdout).to.equal('File specification.yaml already exists. Ignoring...\n');
        done();
      });
  });
});
