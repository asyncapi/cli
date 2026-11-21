import { test } from '@oclif/test';
import TestHelper from '../../helpers/index';
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

    test
      .stdout()
      .command(['new:file', '--no-tty', '-n=specification.yaml', '--json'])
      .it('returns structured file data', (ctx) => {
        const output = JSON.parse(ctx.stdout);
        expect(output.status).to.equal('success');
        expect(output.data.path).to.match(/specification\.yaml$/);
        expect(output.data.format).to.equal('yaml');
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
      .it('should fail when the file already exists', async (ctx,done) => {
        expect(ctx.stderr).to.contain('A file named specification.yaml already exists. Please choose a different name.');
        expect(ctx.stdout).to.equal('');
        done();
      });
  });
});
