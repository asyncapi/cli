import path from 'path';
import { test } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../../helpers';
import inquirer from 'inquirer';
import {Optimizations, Outputs} from '../../../src/commands/optimize';

const testHelper = new TestHelper();
const optimizedFilePath = './test/functionality/specification.yml';
const unoptimizedFile = './test/functionality/dummyspec/unoptimizedSpec.yml';
const invalidFile = './test/functionality/specification-invalid.yml';

describe('optimize', () => {
  describe('no optimization needed', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    beforeAll(() => {
      createMockServer();
    });

    afterAll(() => {
      stopMockServer();
    });

    test
      .stderr()
      .stdout()
      .command(['optimize', optimizedFilePath])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toContain(`No optimization has been applied since ${optimizedFilePath} looks optimized!`);
        expect(ctx.stderr).toEqual('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', './test/functionality/not-found.yml'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toContain('ValidationError');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', 'http://localhost:8080/dummySpec.yml'])
      .it('works when url is passed', (ctx, done) => {
        expect(ctx.stdout).toContain('No optimization has been applied since http://localhost:8080/dummySpec.yml looks optimized!');
        expect(ctx.stderr).toEqual('');
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
        expect(ctx.stdout).toContain(`No optimization has been applied since ${path.resolve(__dirname, '../specification.yml')} looks optimized!`);
        expect(ctx.stderr).toEqual('');
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
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toContain('ValidationError');
        done();
      });
  });

  describe('with no context file', () => {
    beforeEach(() => {
      try {
        testHelper.deleteDummyContextFile();
      } catch (e) {
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
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual('ValidationError: There is no file or context with name "undefined".\n');
        done();
      });
  });

  describe('no-tty flag', () => {
    test
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedFile, '--no-tty'])
      .it('process without going to interactive mode.', (ctx, done) => {
        expect(ctx.stdout).toContain('asyncapi: 2.0.0');
        expect(ctx.stderr).toEqual('');
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
        expect(ctx.stdout).toContain('asyncapi: 2.0.0');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });
  describe('error if the asyncapi file is invalid', () => {
    test
      .stderr()
      .stdout()
      .command(['optimize',invalidFile])
      .it('give ValidationError', (ctx, done) => {
        expect(ctx.stderr).toContain('ValidationError');
        expect(ctx.stdout).toEqual('');
        done();
      });
  });
});

