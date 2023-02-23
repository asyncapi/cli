import { test } from '@oclif/test';
import TestHelper from '../../testHelper';

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

  describe('creation of new project successful', () => {
    afterEach(() => {
      testHelper.deleteDummyProjectDirectory();
    });
    
    test
      .stderr()
      .stdout()
      .command(['new:glee', '-n=test-project'])
      .it('runs new glee command with name flag', async (ctx,done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain('Your project "test-project" has been created successfully!');
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

    // Include the whole error message
    test
      .stderr()
      .stdout()
      .command(['new:glee', '-n=test-project'])
      .it('should throw error if name of the new project already exists', async (ctx,done) => {
        expect(ctx.stderr).toContain('Unable to create the project. We tried to use "test-project" as the directory of your new project but it already exists');
        expect(ctx.stdout).toEqual('');
        done();
      });
  });
});

