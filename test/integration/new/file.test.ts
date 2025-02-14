import { test } from '@oclif/test';
import TestHelper from '../../helpers';
import { expect } from '@oclif/test';

const testHelper = new TestHelper();

describe('new', () => {
  before(() => {
    try {
      testHelper.deleteSpecFileAtWorkingDir();
    } catch (e: any) {
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
  });
  
  describe('create new file', () => {
    afterEach(() => {
      testHelper.deleteSpecFileAtWorkingDir();
    });
    
    test
      .stderr()
      .stdout()
      .command(['new:file', '--no-tty', '-n=specification.yaml'])
      .it('runs new file command', async (ctx,done) => {
        expect(ctx.stderr).to.equal('');
        expect(ctx.stdout).to.equal('The specification.yaml has been successfully created.\n');
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
      testHelper.deleteSpecFileAtWorkingDir();
    });

    test
      .stderr()
      .stdout()
      .command(['new:file', '--no-tty', '-n=specification.yaml'])
      .it('should inform about the existing file and finish the process', async (ctx,done) => {
        expect(ctx.stderr).to.equal('');
        expect(ctx.stdout).to.equal('A file named specification.yaml already exists. Please choose a different name.\n');
        done();
      });
  });
});
