import TestHelper from '../../helpers';
import { describe, before, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';

const testHelper = new TestHelper();
const successMessage = (projectName: string) =>
  '🎉 Your Glee project has been successfully created!';

const errorMessages = {
  alreadyExists: (projectName: string) =>
    `Unable to create the project because the directory "${projectName}" already exists at "${process.cwd()}/${projectName}".
To specify a different name for the new project, please run the command below with a unique project name:`
};

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

    it('runs new glee command with name flag', async () => {
      const { stdout, stderr } = await runCommand([
        'new:glee', '--no-tty', '-n=test-project'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contains(successMessage('test-project'));
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

    it('should throw error if name of the new project already exists', async () => {
      const { stdout, stderr } = await runCommand([
        'new:glee', '--no-tty', '-n=test-project'
      ]);
      expect(stderr).to.contains(`Error: ${errorMessages.alreadyExists('test-project')}`);
      expect(stdout).to.equal('');
    });
  });
});
