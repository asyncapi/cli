import { expect } from 'chai';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

import {
  initContext,
  loadContext,
  addContext,
  removeContext,
  setCurrentContext,
  getContext,
  loadContextFile,
} from '../../../src/domains/models/Context';

import {
  ContextNotFoundError,
  MissingCurrentContextError,
  ContextAlreadyExistsError,
  ContextFileEmptyError,
} from '@errors/context-error';

const { writeFile, mkdir, rm } = fs;

describe('Context Model', () => {
  let tmpDir: string;
  let contextFile: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'context-test-'));
    contextFile = path.join(tmpDir, '.asyncapi-cli');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('initContext()', () => {
    it('should create a new context file', async () => {
      const result = await initContext(tmpDir);
      expect(result).to.be.a('string');
      
      const content = await fs.readFile(result, 'utf8');
      const parsed = JSON.parse(content);
      expect(parsed).to.have.property('store');
      expect(parsed.store).to.deep.equal({});
    });

    it('should handle ~ path', async () => {
      const result = await initContext('~');
      expect(result).to.contain(os.homedir());
    });

    it('should handle . path', async () => {
      const result = await initContext('.');
      expect(result).to.contain(process.cwd());
    });
  });

  describe('loadContext()', () => {
    it('should throw MissingCurrentContextError when no current context', async () => {
      await initContext(tmpDir);
      
      try {
        await loadContext();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(MissingCurrentContextError);
      }
    });

    it('should throw ContextNotFoundError for non-existent context', async () => {
      await initContext(tmpDir);
      
      try {
        await loadContext('nonexistent');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ContextNotFoundError);
      }
    });

    it('should load context by name', async () => {
      await initContext(tmpDir);
      await addContext('test', '/path/to/spec.yaml');
      
      const result = await loadContext('test');
      expect(result).to.equal('/path/to/spec.yaml');
    });

    it('should load current context', async () => {
      await initContext(tmpDir);
      await addContext('test', '/path/to/spec.yaml');
      await setCurrentContext('test');
      
      const result = await loadContext();
      expect(result).to.equal('/path/to/spec.yaml');
    });
  });

  describe('addContext()', () => {
    it('should add a new context', async () => {
      await initContext(tmpDir);
      await addContext('test', '/path/to/spec.yaml');
      
      const fileContent = await loadContextFile();
      expect(fileContent.store['test']).to.equal('/path/to/spec.yaml');
    });

    it('should throw ContextAlreadyExistsError for duplicate', async () => {
      await initContext(tmpDir);
      await addContext('test', '/path/to/spec.yaml');
      
      try {
        await addContext('test', '/path/to/other.yaml');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ContextAlreadyExistsError);
      }
    });
  });

  describe('removeContext()', () => {
    it('should remove a context', async () => {
      await initContext(tmpDir);
      await addContext('test', '/path/to/spec.yaml');
      await removeContext('test');
      
      const fileContent = await loadContextFile();
      expect(fileContent.store).to.not.have.property('test');
    });

    it('should throw ContextNotFoundError for non-existent', async () => {
      await initContext(tmpDir);
      
      try {
        await removeContext('nonexistent');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ContextNotFoundError);
      }
    });
  });

  describe('setCurrentContext()', () => {
    it('should set current context', async () => {
      await initContext(tmpDir);
      await addContext('test', '/path/to/spec.yaml');
      await setCurrentContext('test');
      
      const fileContent = await loadContextFile();
      expect(fileContent.current).to.equal('test');
    });

    it('should throw ContextNotFoundError for non-existent', async () => {
      await initContext(tmpDir);
      
      try {
        await setCurrentContext('nonexistent');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ContextNotFoundError);
      }
    });
  });

  describe('getContext()', () => {
    it('should get context details', async () => {
      await initContext(tmpDir);
      await addContext('test', '/path/to/spec.yaml');
      await setCurrentContext('test');
      
      const result = await getContext('test');
      expect(result).to.have.property('current', 'test');
      expect(result).to.have.property('context', '/path/to/spec.yaml');
    });

    it('should throw ContextNotFoundError for non-existent', async () => {
      await initContext(tmpDir);
      
      try {
        await getContext('nonexistent');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ContextNotFoundError);
      }
    });
  });

  describe('loadContextFile()', () => {
    it('should load context file', async () => {
      await initContext(tmpDir);
      
      const fileContent = await loadContextFile();
      expect(fileContent).to.have.property('store');
    });

    it('should throw ContextFileEmptyError for empty file', async () => {
      await writeFile(contextFile, '', 'utf8');
      
      try {
        await loadContextFile();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(ContextFileEmptyError);
      }
    });
  });
});
