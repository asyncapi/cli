import { exec } from 'child_process';
import * as path from 'path';

import TestHelper from '../testHelper';

const testHelper = new TestHelper();

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
    exec('node ./bin/run config context add test ./test/specification.yml', (code, stdout, stderr) => {
      expect(stdout).toMatch('Added context \"test\".\n\nYou can set it as your current context: asyncapi context use test\nYou can use this context when needed by passing test as a parameter: asyncapi validate test');
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
    exec('node ./bin/run config context add code ./test/specification.yml', () => {
      exec('node ./bin/run config context use code', (code, stdout, stderr) => {
        expect(stderr).toMatch('code is set as current');
        done();
      });
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
