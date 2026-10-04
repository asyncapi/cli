import path from 'path';
import { test } from '@oclif/test';
import TestHelper, { createMockServer, stopMockServer } from '../helpers/index';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import {Optimizations, Outputs} from '../../src/apps/cli/commands/optimize';
import { expect } from '@oclif/test';

const testHelper = new TestHelper();
const optimizedFilePath = './test/fixtures/specification.yml';
const unoptimizedYamlFile = './test/fixtures/dummyspec/unoptimizedSpec.yml';
const unoptimizedJsonFile = './test/fixtures/dummyspec/unoptimizedSpec.json';
const invalidFile = './test/fixtures/specification-invalid.yml';
const asyncapiv3 = './test/fixtures/specification-v3.yml';

describe('optimize', () => {
  describe('move-all-only optimization', () => {
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
      .it('applies move-all when a file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.contain('📄 Here is your optimized AsyncAPI document:');
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', './test/fixtures/not-found.yml'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.contain('ValidationError: There is no file or context with name "./test/fixtures/not-found.yml".');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', 'http://localhost:8080/dummySpecWithoutSecurity.yml'])
      .it('applies move-all when a URL is passed', (ctx, done) => {
        expect(ctx.stdout).to.contain('📄 Here is your optimized AsyncAPI document:');
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
        expect(ctx.stdout).to.contain('📄 Here is your optimized AsyncAPI document:');
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
      .stub(inquirer, 'prompt', (stub) => stub.rejects(new Error('prompted in JSON mode')))
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedYamlFile, '--json'])
      .it('returns structured output without prompting', (ctx, done) => {
        const result = JSON.parse(ctx.stdout);
        expect(result.status).to.equal('success');
        expect(result.data.source).to.deep.equal({
          input: unoptimizedYamlFile,
          kind: 'file',
          resolved: path.resolve(unoptimizedYamlFile),
        });
        expect(result.data.optimized).to.equal(true);
        expect(result.data.applied).to.include(Optimizations.MOVE_ALL_TO_COMPONENTS);
        expect(result.data.ignored).to.deep.equal([]);
        expect(result.data.report).to.be.an('array');
        expect(result.data.document).to.be.an('object');
        expect(result.data.output).to.equal(null);
        expect(result.data.warnings).to.deep.equal([]);
        done();
      });

    test
      .stdout()
      .do(() => fs.removeSync('./test/fixtures/dummyspec/unoptimizedSpec_optimized.yml'))
      .command(['optimize', unoptimizedYamlFile, '--json', '--output=new-file'])
      .it('returns an absolute written-file descriptor', (ctx, done) => {
        const result = JSON.parse(ctx.stdout);
        const outputPath = path.resolve('./test/fixtures/dummyspec/unoptimizedSpec_optimized.yml');
        expect(result.data.document).to.equal(null);
        expect(result.data.output).to.deep.equal({
          path: outputPath,
          format: 'yaml',
          overwritten: false,
        });
        fs.removeSync(outputPath);
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedYamlFile, '--no-tty'])
      .it('process without going to interactive mode.', (ctx, done) => {
        expect(ctx.stdout).to.contain('asyncapi: 2.0.0');
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedYamlFile, '--no-tty', '-o', 'new-file'])
      .it('generate YAML output against YAML input and show its path.', (ctx, done) => {
        const pos = unoptimizedYamlFile.lastIndexOf('.');
        const optimizedFile = `${unoptimizedYamlFile.substring(0, pos)}_optimized.${unoptimizedYamlFile.substring(pos + 1)}`;
        expect(ctx.stdout).to.contain(`✅ Success! Your optimized file has been created at ${optimizedFile}.`);
        expect(ctx.stderr).to.equal('');
        expect(fs.readFileSync(optimizedFile, 'utf8')).to.contain('asyncapi: 2.0.0');
        fs.unlinkSync(optimizedFile);
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedJsonFile, '--no-tty', '-o', 'new-file'])
      .it('generate JSON output against JSON input and show its path.', (ctx, done) => {
        const pos = unoptimizedJsonFile.lastIndexOf('.');
        const optimizedFile = `${unoptimizedJsonFile.substring(0, pos)}_optimized.${unoptimizedJsonFile.substring(pos + 1)}`;
        expect(ctx.stdout).to.contain(`✅ Success! Your optimized file has been created at ${optimizedFile}.`);
        expect(ctx.stderr).to.equal('');
        expect(fs.readFileSync(optimizedFile, 'utf8')).to.contain('"asyncapi": "2.0.0"');
        fs.unlinkSync(optimizedFile);
        done();
      });
  });

  describe('interactive terminal', () => {
    test
      .stub(inquirer, 'prompt', (stub) => stub.resolves({optimization: [Optimizations.REMOVE_COMPONENTS] , output: Outputs.TERMINAL}))
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedYamlFile])
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
      .command(['optimize', './test/fixtures/dummyspec/not-asyncapi.yml', '--json'])
      .it('preserves optimizer parser diagnostics in structured errors', (ctx, done) => {
        const result = JSON.parse(ctx.stdout);
        expect(result.status).to.equal('error');
        expect(result.errors[0].code).to.equal('DOCUMENT_PARSE_FAILED');
        expect(result.data.details).to.be.an('array').with.length.greaterThan(0);
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['optimize',invalidFile])
      .it('propagates OptimizerParseError', (ctx, done) => {
        expect(ctx.stderr).to.contain('OptimizerParseError: Parsing failed.');
        expect(ctx.stdout).to.equal('');
        done();
      });

    // v2: parser diagnostics are returned on OptimizerParseError.details instead of console.error
    test
      .stderr()
      .stdout()
      .command(['optimize', './test/fixtures/dummyspec/not-asyncapi.yml'])
      .it('surfaces parser diagnostics with OptimizerParseError when the asyncapi version field is missing', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.contain('OptimizerParseError: Parsing failed.');
        expect(ctx.stderr).to.contain('This is not an AsyncAPI document.');
        expect(ctx.stderr).to.contain('field as string is missing');
        done();
      });
  });
});
