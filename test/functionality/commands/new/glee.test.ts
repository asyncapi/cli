import { test } from '@oclif/test';
import TestHelper from '../../../helpers';
import { PROJECT_DIRECTORY_PATH } from '../../../helpers';

const testHelper = new TestHelper();

describe('new glee', () => {
  beforeAll(() => {
    try {
      testHelper.deleteDummyProjectDirectory();
    } catch (e) {
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
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toEqual('Your project "test-project" has been created successfully!\n\nNext steps:\n\n  cd test-project\n  npm install\n  npm run dev\n\nAlso, you can already open the project in your favorite editor and start tweaking it.\n');
        done();
      });
  });

  describe('when new project name already exists', () => {    
    beforeEach(() => {
      try {
        testHelper.createDummyProjectDirectory();
      } catch (e) {
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
        expect(ctx.stderr).toEqual(`Error: Unable to create the project. We tried to use "test-project" as the directory of your new project but it already exists (${PROJECT_DIRECTORY_PATH}). Please specify a different name for the new project. For example, run the following command instead:\n\n  asyncapi new glee --name test-project-1\n\n`);
        expect(ctx.stdout).toEqual('');
        done();
      });
  });
});

