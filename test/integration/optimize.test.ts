import path from 'path';
import { test } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';
import inquirer from 'inquirer';
import {Optimizations, Outputs} from '../../src/commands/optimize';
import { expect } from '@oclif/test';

const testHelper = new TestHelper();
const optimizedFilePath = './test/fixtures/specification.yml';
const unoptimizedFile = './test/fixtures/dummyspec/unoptimizedSpec.yml';
const invalidFile = './test/fixtures/specification-invalid.yml';
const asyncapiv3 = './test/fixtures/specification-v3.yml';

describe('optimize', () => {
  describe('no optimization needed', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    before(() => {
      createMockServer();
    });

    after(() => {
      stopMockServer();
    });

    test
      .stderr()
      .stdout()
      .command(['optimize', optimizedFilePath])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.contain(`🎉 Great news! Your file at ${optimizedFilePath} is already optimized.`);
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', './test/fixtures/not-found.yml'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.contain('ValidationError');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', 'http://localhost:8080/dummySpecWithoutSecurity.yml'])
      .it('works when url is passed', (ctx, done) => {
        expect(ctx.stdout).to.contain('🎉 Great news! Your file at http://localhost:8080/dummySpecWithoutSecurity.yml is already optimized.');
        expect(ctx.stderr).to.equal('');
        done();
      });
    test
      .stderr()
      .stdout()
      .command(['optimize', 'http://localhost:8080/dummySpec.yml --proxyHost=host --proxyPort=8080'])
      .it('should throw error when url is passed with proxyHost and proxyPort with invalid host ', (ctx, done) => {
        expect(ctx.stdout).to.contain('');
        expect(ctx.stderr).to.equal('Error: Proxy Connection Error: Unable to establish a connection to the proxy check hostName or PortNumber.\n');
        done();
      });
  });

  describe('with no arguments', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.setCurrentContext('home');
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['optimize'])
      .it('converts from current context', (ctx, done) => {
        expect(ctx.stdout).to.contain(`🎉 Great news! Your file at ${path.resolve(__dirname, '../fixtures/specification.yml')} is already optimized.`);
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .do(() => {
        testHelper.unsetCurrentContext();
        testHelper.createDummyContextFile();
      })
      .command(['optimize'])
      .it('throws error message if no current context', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.contain('ValidationError');
        done();
      });
  });

  describe('with no context file', () => {
    beforeEach(() => {
      try {
        testHelper.deleteDummyContextFile();
      } catch (e: any) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }
    });

    test
      .stderr()
      .stdout()
      .command(['optimize'])
      .it('throws error message if no context file exists', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal('ValidationError: Unable to perform validation. Specify what AsyncAPI file should be validated.\n\nThese are your options to specify in the CLI what AsyncAPI file should be used:\n- You can provide a path to the AsyncAPI file: asyncapi validate path/to/file/asyncapi.yml\n- You can also pass a saved context that points to your AsyncAPI file: asyncapi validate mycontext\n- In case you did not specify a context that you want to use, the CLI checks if there is a default context and uses it. To set default context run: asyncapi context use mycontext\n- In case you did not provide any reference to AsyncAPI file and there is no default context, the CLI detects if in your current working directory you have files like asyncapi.json, asyncapi.yaml, asyncapi.yml. Just rename your file accordingly.\n');
        done();
      });
  });

  describe('no-tty flag', () => {
    test
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedFile, '--no-tty'])
      .it('process without going to interactive mode.', (ctx, done) => {
        expect(ctx.stdout).to.contain('asyncapi: 2.0.0');
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('interactive terminal', () => {
    test
      .stub(inquirer, 'prompt', () => {
        return Promise.resolve({optimization: [Optimizations.REMOVE_COMPONENTS] , output: Outputs.TERMINAL});
      })
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedFile])
      .it('interactive terminal, only remove components and outputs to terminal', (ctx, done) => {
        expect(ctx.stdout).to.contain('asyncapi: 2.0.0');
        expect(ctx.stderr).to.equal('');
        done();
      });
  });
  describe('error if the asyncapi file is invalid', () => {
    test
      .stderr()
      .stdout()
      .command(['optimize',invalidFile])
      .it('give ValidationError', (ctx, done) => {
        expect(ctx.stderr).to.contain('ValidationError');
        expect(ctx.stdout).to.equal('');
        done();
      });
  });
});

