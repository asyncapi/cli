import { test } from '@oclif/test';
import TestHelper from '../../helpers';
import { PROJECT_DIRECTORY_PATH } from '../../helpers';
import { expect } from '@oclif/test';

const testHelper = new TestHelper();
const successMessage = (projectName: string) =>
  '🎉 Your Glee project has been successfully created!';

const errorMessages = {
  alreadyExists: (projectName: string) =>
    `Unable to create the project because the directory "${projectName}" already exists at "${process.cwd()}/${projectName}".
To specify a different name for the new project, please run the command below with a unique project name:`};

describe('new glee', () => {
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
      .command(['new:glee', '-n=test-project'])
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
      .command(['new:glee', '-n=test-project'])
      .it('should throw error if name of the new project already exists', async (ctx,done) => {
        expect(ctx.stderr).to.contains(`Error: ${errorMessages.alreadyExists('test-project')}`);
        expect(ctx.stdout).to.equal('');
        done();
      });
  });
});

