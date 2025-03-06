import * as path from 'path';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import TestHelper from '../helpers';
import { CONTEXT_FILE_PATH } from '../../src/core/models/Context';

const testHelper = new TestHelper();

describe('config:context, positive scenario', () => {
  before(() => {
    testHelper.createDummyContextFile();
  });

  after(() => {
    testHelper.deleteDummyContextFile();
  });

  describe('config:context:current', () => {
    it('should show current context', async () => {
      const { stdout, stderr } = await runCommand(['config:context:current']);
      expect(stdout).to.equals(
        `${testHelper.context.current}: ${testHelper.context.store['home']}\n`
      );
      expect(stderr).to.equals('');
    });
  });

  describe('config:context:list', () => {
    it('should list contexts prints list if context file is present', async () => {
      const { stdout, stderr } = await runCommand(['config:context:list']);
      expect(stdout).to.equals(
        `home: ${path.resolve(
          __dirname,
          '../fixtures/specification.yml'
        )}\ncode: ${path.resolve(__dirname, '../fixtures/specification.yml')}\n`
      );
      expect(stderr).to.equals('');
    });
  });

  describe('config:context:add', () => {
    it('should add new context called "test"', async () => {
      const { stdout, stderr } = await runCommand(['config:context:add', 'test', './test/integration/specification.yml']);
      expect(stdout).to.equals(
        '🎉 Context test added successfully!\nYou can set it as your current context:\n  asyncapi config context use test\nYou can use this context when needed by passing test as a parameter:\n  asyncapi validate test\n'
      );
      expect(stderr).to.equals('');
    });

    it('should NOT add new context with already existing in context file name "test"', async () => {
      const { stdout, stderr } = await runCommand(['config:context:add', 'test', './test/specification.yml']);
      expect(stdout).to.equals('');
      expect(stderr).to.equals(
        `ContextError: Context with name "test" already exists in context file "${CONTEXT_FILE_PATH}".\n`
      );
    });
  });

  describe('config:context:edit', () => {
    it('should edit existing context "test"', async () => {
      const { stdout, stderr } = await runCommand(['config:context:edit', 'test', './test/specification2.yml']);
      expect(stdout).to.contain('🎉 Context test edited successfully!');
      expect(stderr).to.equals('');
    });
  });

  describe('config:context:use', () => {
    it('should update the current context', async () => {
      const { stdout, stderr } = await runCommand(['config:context:use', 'code']);
      expect(stdout).to.equals('Context code is now set as current.\n');
      expect(stderr).to.equals('');
    });
  });

  describe('config:context:remove', () => {
    it('should remove existing context', async () => {
      const { stdout, stderr } = await runCommand(['config:context:remove', 'code']);
      expect(stdout).to.equals('Context code removed successfully!\n\n');
      expect(stderr).to.equals('');
    });
  });

  describe('config:context:init', () => {
    it('should initialize new empty context file without a switch', async () => {
      const { stdout, stderr } = await runCommand(['config:context:init']);
      expect(stdout).to.contain('🎉 Context initialized at');
      expect(stderr).to.equals('');
    });

    it('should initialize new empty context file with switch "."', async () => {
      const { stdout, stderr } = await runCommand(['config:context:init', '.']);
      expect(stdout).to.contain('🎉 Context initialized at');
      expect(stderr).to.equals('');
    });

    it('should initialize new empty context file with switch "./"', async () => {
      const { stdout, stderr } = await runCommand(['config:context:init', './']);
      expect(stdout).to.contain('🎉 Context initialized at');
      expect(stderr).to.equals('');
    });

    it('should initialize new empty context file with switch "~"', async () => {
      const { stdout, stderr } = await runCommand(['config:context:init', '~']);
      expect(stdout).to.contain('🎉 Context initialized at');
      expect(stderr).to.equals('');
    });
  });
});

describe('config:context, negative scenario', () => {
  before(() => {
    testHelper.createDummyContextFileWrong('');
  });

  after(() => {
    testHelper.deleteDummyContextFile();
  });

  describe('config:context:add', () => {
    it('should throw error on zero-sized file saying that context file has wrong format.', async () => {
      testHelper.deleteDummyContextFile();
      testHelper.createDummyContextFileWrong('');
      const { stdout, stderr } = await runCommand(['config:context:add', 'home', './test/specification.yml']);
      expect(stdout).to.equals('');
      expect(stderr).to.contain(
        `ContextError: Context file "${CONTEXT_FILE_PATH}" has wrong format.`
      );
    });

    it('should throw error on file with empty object saying that context file has wrong format.', async () => {
      testHelper.deleteDummyContextFile();
      testHelper.createDummyContextFileWrong('{}');
      const { stdout, stderr } = await runCommand(['config:context:add', 'home', './test/specification.yml']);
      expect(stdout).to.equals('');
      expect(stderr).to.contain(
        `ContextError: Context file "${CONTEXT_FILE_PATH}" has wrong format.`
      );
    });

    it('should throw error on file with empty array saying that context file has wrong format.', async () => {
      testHelper.deleteDummyContextFile();
      testHelper.createDummyContextFileWrong('[]');
      const { stdout, stderr } = await runCommand(['config:context:add', 'home', './test/specification.yml']);
      expect(stdout).to.equals('');
      expect(stderr).to.contain(
        `ContextError: Context file "${CONTEXT_FILE_PATH}" has wrong format.`
      );
    });

    it('should throw error on file with object having three root properties, saying that context file has wrong format.', async () => {
      testHelper.deleteDummyContextFile();
      testHelper.createDummyContextFileWrong(
        '{"current":"home","current2":"test","store":{"home":"homeSpecFile","code":"codeSpecFile"}}'
      );
      const { stdout, stderr } = await runCommand(['config:context:add', 'home', './test/specification.yml']);
      expect(stdout).to.equals('');
      expect(stderr).to.contain(
        `ContextError: Context file "${CONTEXT_FILE_PATH}" has wrong format.`
      );
    });
  });

  describe('config:context:list', () => {
    it('should output info message (to stdout, NOT stderr) about absence of context file.', async () => {
      testHelper.deleteDummyContextFile();
      const { stdout, stderr } = await runCommand(['config:context:list']);
      expect(stdout).to.contain('Unable to list contexts. You have no context file configured.');
      expect(stderr).to.equals('');
    });
  });
});
