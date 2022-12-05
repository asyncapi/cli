import path from 'path';
import { test } from '@oclif/test';
import { NO_CONTEXTS_SAVED } from '../../src/errors/context-error';
import TestHelper from '../testHelper';
import inquirer from 'inquirer';
import {Optimizations, Outputs} from '../../src/commands/optimize';

const testHelper = new TestHelper();
const optimizedFilePath = './test/specification.yml';
const unoptimizedFile = './test/dummyspec/unoprimizedSpec.yml';

describe('optimize', () => {
  describe('no optimization needed', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['optimize', optimizedFilePath])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toContain(`File ${optimizedFilePath} looks optimized!`);
        expect(ctx.stderr).toEqual('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', './test/not-found.yml'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual('error loading AsyncAPI document from file: ./test/not-found.yml file does not exist.\n');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', 'https://bit.ly/asyncapi'])
      .it('works when url is passed', (ctx, done) => {
        expect(ctx.stdout).toContain('URL https://bit.ly/asyncapi looks optimized!');
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
        expect(ctx.stdout).toContain(`File ${path.resolve(__dirname, '../specification.yml')} looks optimized!`);
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
        expect(ctx.stderr).toEqual('ContextError: No context is set as current, please set a current context.\n');
        done();
      });

    test
      .stderr()
      .stdout()
      .do(() => {
        testHelper.deleteDummyContextFile();
      })
      .command(['optimize'])
      .it('throws error message if no context file exists', (ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual(`error locating AsyncAPI document: ${NO_CONTEXTS_SAVED}\n`);
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
        expect(ctx.stdout).toContain('components can be moved to the components sections.');
        expect(ctx.stdout).toContain('unused components can be removed.');
        expect(ctx.stdout).toContain('components can be reused.');
        expect(ctx.stdout).toContain('asyncapi: 2.0.0');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });
});

