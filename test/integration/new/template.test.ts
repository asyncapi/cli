import TestHelper from '../../helpers';
import { describe, before, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';

const testHelper = new TestHelper();
const successMessage = (projectName: string) =>
  '🎉 Your template is successfully created';

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

    it('runs new glee command with name flag', async () => {
      const { stdout, stderr } = await runCommand([
        'new:template', '--no-tty', '-n=test-project'
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
        'new:template', '--no-tty', '-n=test-project'
      ]);
      expect(stderr).to.contains(`Error: ${errorMessages.alreadyExists('test-project')}`);
      expect(stdout).to.equal('');
    });
  });
});
