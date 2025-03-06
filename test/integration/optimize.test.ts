import * as path from 'path';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';
import inquirer from 'inquirer';
import { Optimizations, Outputs } from '../../src/commands/optimize';
import sinon from 'sinon';

const testHelper = new TestHelper();
const optimizedFilePath = './test/fixtures/specification.yml';
const unoptimizedFile = './test/fixtures/dummyspec/unoptimizedSpec.yml';
const invalidFile = './test/fixtures/specification-invalid.yml';

describe('optimize', () => {
  before(() => {
    createMockServer();
  });

  after(() => {
    stopMockServer();
  });

  describe('no optimization needed', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    it('works when file path is passed', async () => {
      const { stdout, stderr } = await runCommand(['optimize', optimizedFilePath]);
      expect(stdout).to.contain(`🎉 Great news! Your file at ${optimizedFilePath} is already optimized.`);
      expect(stderr).to.equal('');
    });

    it('should throw error if file path is wrong', async () => {
      const { stdout, stderr } = await runCommand(['optimize', './test/fixtures/not-found.yml']);
      expect(stdout).to.equal('');
      expect(stderr).to.contain('ValidationError');
    });

    it('works when url is passed', async () => {
      const { stdout, stderr } = await runCommand(['optimize', 'http://localhost:8080/dummySpecWithoutSecurity.yml']);
      expect(stdout).to.contain('🎉 Great news! Your file at http://localhost:8080/dummySpecWithoutSecurity.yml is already optimized.');
      expect(stderr).to.equal('');
    });

    it('should throw error when url is passed with proxyHost and proxyPort with invalid host', async () => {
      const { stdout, stderr } = await runCommand(['optimize', 'http://localhost:8080/dummySpec.yml', '--proxyHost=host', '--proxyPort=8080']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('Error: Proxy Connection Error: Unable to establish a connection to the proxy check hostName or PortNumber.\n');
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

    it('converts from current context', async () => {
      const { stdout, stderr } = await runCommand(['optimize']);
      expect(stdout).to.contain(`🎉 Great news! Your file at ${path.resolve(__dirname, '../fixtures/specification.yml')} is already optimized.`);
      expect(stderr).to.equal('');
    });

    it('throws error message if no current context', async () => {
      testHelper.unsetCurrentContext();
      testHelper.createDummyContextFile();
      const { stdout, stderr } = await runCommand(['optimize']);
      expect(stdout).to.equal('');
      expect(stderr).to.contain('ValidationError');
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

    it('throws error message if no context file exists', async () => {
      const { stdout, stderr } = await runCommand(['optimize']);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('ValidationError: There is no file or context with name "undefined".\n');
    });
  });

  describe('no-tty flag', () => {
    it('process without going to interactive mode', async () => {
      const { stdout, stderr } = await runCommand(['optimize', unoptimizedFile, '--no-tty']);
      expect(stdout).to.contain('asyncapi: 2.0.0');
      expect(stderr).to.equal('');
    });
  });

  describe('interactive terminal', () => {
  it('interactive terminal, only remove components and outputs to terminal', async () => {
    const stub = sinon.stub(inquirer, 'prompt').resolves({ 
      optimization: [Optimizations.REMOVE_COMPONENTS], 
      output: Outputs.TERMINAL 
    });
    try {
      const { stdout, stderr } = await runCommand(['optimize', unoptimizedFile]);
      expect(stdout).to.contain('asyncapi: 2.0.0');
      expect(stderr).to.equal('');
    } finally {
      stub.restore();
    }
  });
});


  describe('error if the asyncapi file is invalid', () => {
    it('give ValidationError', async () => {
      const { stdout, stderr } = await runCommand(['optimize', invalidFile]);
      expect(stdout).to.equal('');
      expect(stderr).to.contain('ValidationError');
    });
  });
});
