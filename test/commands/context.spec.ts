import { exec } from 'child_process';
import { ContextTestingHelper } from '../../src/constants';
import * as path from 'path';

const testHelper = new ContextTestingHelper();

describe('context list', () => {
  afterAll(() => {
    testHelper.deleteDummyContextFile();
  });

  afterEach(() => {
    testHelper.deleteDummyContextFile();
  });

  it('should print list if contextfile is present', (done) => {
    testHelper.createDummyContextFile();
    exec('node ./bin/run config context list', (code, stdout) => {
      expect(stdout).toBeDefined();
      done();
    });
  });
});

describe('context add ', () => {
  afterAll(() => {
    testHelper.deleteDummyContextFile();
  });

  it('should add new test', (done) => {
    testHelper.createDummyContextFile();
    exec('node ./bin/run config context add test ./test/specification.yml', (code, stdout) => {
      expect(stdout).toMatch(`test: ${path.resolve(
        process.cwd(), './test/specification.yml'
      )}`);
      done();
    });
  });
});

describe('context use ', () => {
  afterAll(() => {
    testHelper.deleteDummyContextFile();
  });
  
  it('should update the current context', (done) => {
    testHelper.createDummyContextFile();
    exec('node ./bin/run config context use code', (code, stdout) => {
      console.log(stdout);
      expect(stdout).toMatch('code is set as current');
      done();
    });
  });
});

describe('context remove ', () => {
  afterAll(() => {
    testHelper.createDummyContextFile();
  });

  it('should remove a context', (done) => {
    testHelper.createDummyContextFile();
    exec('node ./bin/run config context remove code', (code, stdout) => {
      expect(stdout).toMatch('code successfully deleted');
      done();
    });
  });
});
