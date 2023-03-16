import path from 'path';
import { test } from '@oclif/test';

import TestHelper from '../testHelper';

const testHelper = new TestHelper();

describe('config', () => {
  beforeEach(() => {
    testHelper.createDummyContextFile();
  });

  afterEach(() => {
    testHelper.deleteDummyContextFile();
  });

  describe('config:context:list', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:list'])
      .it('should list contexts prints list if context file is present', (ctx, done) => {
        expect(ctx.stdout).toEqual(
          `home: ${path.resolve(__dirname, '../specification.yml')}\ncode: ${path.resolve(__dirname, '../specification.yml')}\n`
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('config:context:add', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:add', 'test', './test/specification.yml'])
      .it('should add new context called "test"', (ctx, done) => {
        expect(ctx.stdout).toEqual(
          'Added context "test".\n\nYou can set it as your current context: asyncapi config context use test\nYou can use this context when needed by passing test as a parameter: asyncapi validate test\n'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('config:context:use', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:use', 'code'])
      .it('should update the current context', (ctx, done) => {
        expect(ctx.stdout).toEqual(
          'code is set as current\n'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('config:context:remove', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:remove', 'code'])
      .it('should remove existing context', (ctx, done) => {
        expect(ctx.stdout).toEqual(
          'code successfully deleted\n'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('config:context:current', () => {
    test
      .stderr()
      .stdout()
      .command(['config:context:current'])
      .it('should show current context', (ctx, done) => {
        expect(ctx.stdout).toEqual(`${testHelper.context.current}: ${testHelper.context.store['home']}\n`);
        expect(ctx.stderr).toEqual('');
        done();
      });
  });
});
