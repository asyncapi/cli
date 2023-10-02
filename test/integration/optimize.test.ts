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
  describe('should handle AsyncAPI v3 document correctly', () => {
    test
      .stderr()
      .stdout()
      .command(['optimize', asyncapiv3])
      .it('give error', (ctx, done) => {
        expect(ctx.stderr).to.equal('Error: Optimize command does not support AsyncAPI v3 yet, please checkout https://github.com/asyncapi/optimizer/issues/168\n');
        expect(ctx.stdout).to.equal('');
        done();
      });
  });

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
        expect(ctx.stdout).to.contain(`No optimization has been applied since ${optimizedFilePath} looks optimized!`);
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
      .command(['optimize', 'http://localhost:8080/dummySpec.yml'])
      .it('works when url is passed', (ctx, done) => {
        expect(ctx.stdout).to.contain('No optimization has been applied since http://localhost:8080/dummySpec.yml looks optimized!');
        expect(ctx.stderr).to.equal('');
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
        expect(ctx.stdout).to.contain(`No optimization has been applied since ${path.resolve(__dirname, '../fixtures/specification.yml')} looks optimized!`);
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
        expect(ctx.stderr).to.equal('ValidationError: There is no file or context with name "undefined".\n');
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

