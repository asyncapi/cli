import { test } from '@oclif/test';
import TestHelper from '../../helpers';
import { expect } from '@oclif/test';
import { cyan, gray } from 'picocolors';
const testHelper = new TestHelper();
const successMessage = (projectName: string) =>
  '🎉 Your template is succesfully created';

const errorMessages = {
  alreadyExists: (projectName: string) =>
    'Unable to create the project',
};
describe('new template', () => {
  before(() => {
    try {
      testHelper.deleteDummyProjectDirectory();
    } catch (e: any) {
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
  });

  describe('creation of new project is successful', () => {
    afterEach(() => {
      testHelper.deleteDummyProjectDirectory();
    });

    test
      .stderr()
      .stdout()
      .command(['new:template', '-n=test-project'])
      .it('runs new glee command with name flag', async (ctx,done) => {
        expect(ctx.stderr).to.equal('');
        expect(ctx.stdout).to.contains(successMessage('test-project'));
        done();
      });
  });

  describe('when new project name already exists', () => {
    beforeEach(() => {
      try {
        testHelper.createDummyProjectDirectory();
      } catch (e: any) {
        if (e.code !== 'EEXIST') {
          throw e;
        }
      }
    });

    afterEach(() => {
      testHelper.deleteDummyProjectDirectory();
    });

    test
      .stderr()
      .stdout()
      .command(['new:template', '-n=test-project'])
      .it('should throw error if name of the new project already exists', async (ctx,done) => {
        expect(ctx.stderr).to.contains(`Error: ${errorMessages.alreadyExists('test-project')}`);
        expect(ctx.stdout).to.equal('');
        done();
      });
  });
});

