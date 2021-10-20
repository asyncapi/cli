import { exec } from 'child_process';
import { ValidationMessage, CONTEXT_NOT_FOUND, NO_SPEC_FOUND } from '../../src/messages';
import * as path from 'path';
import { ContextTestingHelper } from '../../src/constants';

const testHelper = new ContextTestingHelper();

describe('validate command when file path is passed', () => {
  afterAll(() => {
    testHelper.deleteDummyContextFile();
  });

  afterEach(() => {
    testHelper.deleteDummyContextFile();
  });

  it('should validate successfully', (done) => {
    exec('node ./bin/run validate ./test/specification.yml', (code, stdout) => {
      expect(stdout).toMatch(
        ValidationMessage(
          path.resolve(process.cwd(), './test/specification.yml')
        ).message()
      );
      done();
    });
  });

  it('should throw error if file path is wrong', (done) => {
    exec('node ./bin/run validate ./spec.yml', (code, stdout) => {
      expect(stdout).toMatch(`Validation Error: ${ValidationMessage(
        path.resolve(process.cwd(), './spec.yml')
      ).error()}`
      );
      done();
    });
  });
});

describe('Validate command when context name is passed', () => {
  afterAll(() => {
    testHelper.deleteDummyContextFile();
  });

  afterEach(() => {
    testHelper.deleteDummyContextFile();
  });

  it('should validate if context name exists', (done) => {
    testHelper.createDummyContextFile();
    exec('node ./bin/run validate code', (code, stdout) => {
      expect(stdout).toMatch(
        ValidationMessage(
          path.resolve(process.cwd(), './test/specification.yml')
        ).message()
      );
      done();
    });
  });

  it('should throw error id context name is not saved', (done) => {
    testHelper.createDummyContextFile();
    exec('node ./bin/run validate test', (code, stdout) => {
      expect(stdout).toMatch(
        `Context Error: ${CONTEXT_NOT_FOUND('test')}`
      );
      done();
    });
  });
});

describe('Validate command when no input is passed', () => {
  afterAll(() => {
    testHelper.deleteDummyContextFile();
  });
  
  afterEach(() => {
    testHelper.deleteDummyContextFile();
  });
  
  it('should validate from current context', (done) => {
    testHelper.createDummyContextFile();
    exec('node ./bin/run validate', (code, stdout) => {
      expect(stdout).toMatch(
        ValidationMessage(
          testHelper.context.store[testHelper.context.current as string]
        ).message()
      );
      done();
    });
  });

  it('should throw error message if no spec path is found', (done) => {
    testHelper.deleteDummyContextFile();
    exec('node ./bin/run validate', (code, stdout) => {
      expect(stdout).toMatch(
        NO_SPEC_FOUND('validate')
      );
      done();
    });
  });
});
