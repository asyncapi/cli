import * as path from 'path';
import { expect, test } from '@oclif/test';

import TestHelper from '../testHelper';

const testHelper = new TestHelper();

describe('config', () => {
  afterEach(() => {
    testHelper.deleteDummyContextFile();
  });

  beforeEach(() => {
    testHelper.createDummyContextFile();
  });
  
  it('should list contexts', () => {
    test
      .stderr()
      .stdout()
      .command(['config', 'context', 'list'])
      .it('prints list if context file is present', (ctx, done) => {
        expect(ctx.stdout).to.equals(
          `home: ${path.resolve(__dirname, '../specification.yml')}\ncode: ${path.resolve(__dirname, '../specification.yml')}\n`
        );
        expect(ctx.stderr).to.equals('');
        done();
      });
  });
  
  it('should add context', () => {
    test
      .stderr()
      .stdout()
      .command(['config', 'context', 'add', 'test', './test/specification.yml'])
      .it('adds new context called "test"', (ctx, done) => {
        expect(ctx.stdout).to.equals(
          'Added context "test".\n\nYou can set it as your current context: asyncapi context use test\nYou can use this context when needed by passing test as a parameter: asyncapi validate test\n'
        );
        expect(ctx.stderr).to.equals('');
        done();
      });
  });
  
  it('should use existing context', () => {
    test
      .stderr()
      .stdout()
      .command(['config', 'context', 'use', 'code'])
      .it('updates the current context', (ctx, done) => {
        expect(ctx.stdout).to.equals(
          'code is set as current\n'
        );
        expect(ctx.stderr).to.equals('');
        done();
      });
  });
  
  it('should remove existing context', () => {
    test
      .stderr()
      .stdout()
      .command(['config', 'context', 'remove', 'code'])
      .it('removes a context', (ctx, done) => {
        expect(ctx.stdout).to.equals(
          'code successfully deleted\n'
        );
        expect(ctx.stderr).to.equals('');
        done();
      });
  });

  it('should show current context', () => {
    test
      .stderr()
      .stdout()
      .command(['config', 'context', 'current'])
      .it('Shows the current context is home',(ctx,done) => {
        expect(ctx.stdout).to.equals(`${testHelper.context.current}: ${testHelper.context.store['home']}\n`);
        expect(ctx.stderr).to.equals('');
        done();
      });
  });
});
