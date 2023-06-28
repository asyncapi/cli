/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/no-identical-functions */
import path from 'path';
import { test } from '@oclif/test';
import { createMockServer, stopMockServer } from '../../testHelper';
const generalOptions = ['generate:models'];
const outputDir = './test/commands/generate/models';

describe('models', () => {
  beforeAll(() => {
    createMockServer();
  });
  afterAll(() => {
    stopMockServer();
  });
  test
    .stderr()
    .stdout()
    .command([...generalOptions, 'typescript', 'http://localhost:8080/streetlights.yml'])
    .it('works with remote AsyncAPI files', (ctx, done) => {
      expect(ctx.stderr).toEqual('');
      expect(ctx.stdout).toMatchSnapshot();
      done();
    });

  test
    .stderr()
    .stdout()
    .command([...generalOptions, 'random', './test/specification.yml', `-o=${ path.resolve(outputDir, './random')}`])
    .it('fails when it dont know the language', (ctx, done) => {
      expect(ctx.stderr).toEqual('Error: Expected random to be one of: typescript, csharp, golang, java, javascript, dart, python, rust, kotlin, php, cplusplus\nSee more help with --help\n');
      expect(ctx.stdout).toEqual('');
      done();
    });
  test
    .stderr()
    .stdout()
    .command([...generalOptions, 'typescript', './test/specification.yml'])
    .it('works when generating in memory', (ctx, done) => {
      expect(ctx.stderr).toEqual('');
      expect(ctx.stdout).toMatchSnapshot();
      done();
    });

  describe('for TypeScript', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'typescript', './test/specification.yml', `-o=${ path.resolve(outputDir, './ts')}`])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'typescript', './test/specification.yml', `-o=${ path.resolve(outputDir, './ts')}`, '--tsJsonBinPack'])
      .it('works when tsJsonBinPack is set', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'typescript', './test/specification.yml', '--tsMarshalling'])
      .it('works when tsMarshalling is set', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'typescript', './test/specification.yml', '--tsIncludeComments'])
      .it('works when tsIncludeComments is set', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toMatchSnapshot();
        done();
      });
  });

  describe('for JavaScript', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'javascript', './test/specification.yml', `-o=${ path.resolve(outputDir, './js')}`])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('for Python', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'python', './test/specification.yml', `-o=${ path.resolve(outputDir, './python')}`])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('for Rust', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'rust', './test/specification.yml', `-o=${ path.resolve(outputDir, './rust')}`])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('for C#', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${path.resolve(outputDir, './csharp')}`, '--namespace=\'asyncapi.models\''])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${ path.resolve(outputDir, './csharp')}`])
      .it('fails when no namespace provided', (ctx, done) => {
        expect(ctx.stderr).toEqual('Error: In order to generate models to C#, we need to know which namespace they are under. Add `--namespace=NAMESPACE` to set the desired namespace.\n');
        expect(ctx.stdout).toEqual('');
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${ path.resolve(outputDir, './csharp')}`, '--namespace=\'asyncapi.models\'', '--csharpAutoImplement'])
      .it('works when auto implement properties flag is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${ path.resolve(outputDir, './csharp')}`, '--namespace=\'asyncapi.models\'', '--csharpNewtonsoft'])
      .it('works when newtonsoft flag is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${ path.resolve(outputDir, './csharp')}`, '--namespace=\'asyncapi.models\'', '--csharpHashcode'])
      .it('works when hash code flag is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });

    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${ path.resolve(outputDir, './csharp')}`, '--namespace=\'asyncapi.models\'', '--csharpEqual'])
      .it('works when equal flag is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });

    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${ path.resolve(outputDir, './csharp')}`, '--namespace=\'asyncapi.models\'', '--csharpSystemJson'])
      .it('works when system json flag is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });

    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${ path.resolve(outputDir, './csharp')}`, '--namespace=\'asyncapi.models\'', '--csharpArrayType=List'])
      .it('works when array type is provided', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
  });

  describe('for C++', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'cplusplus', './test/specification.yml', `-o=${path.resolve(outputDir, './cplusplus')}`, '--namespace=\'AsyncapiModels\''])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'cplusplus', './test/specification.yml', `-o=${ path.resolve(outputDir, './cplusplus')}`])
      .it('fails when no namespace provided', (ctx, done) => {
        expect(ctx.stderr).toEqual('Error: In order to generate models to C++, we need to know which namespace they are under. Add `--namespace=NAMESPACE` to set the desired namespace.\n');
        expect(ctx.stdout).toEqual('');
        done();
      });
  });

  describe('for Java', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'java', './test/specification.yml', `-o=${ path.resolve(outputDir, './java')}`, '--packageName', 'test.pkg'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'java', './test/specification.yml', `-o=${ path.resolve(outputDir, './java')}`])
      .it('fails when no package defined', (ctx, done) => {
        expect(ctx.stderr).toEqual('Error: In order to generate models to Java, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.\n');
        expect(ctx.stdout).toEqual('');
        done();
      });
  });

  describe('for Go', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'golang', './test/specification.yml', `-o=${ path.resolve(outputDir, './go')}`, '--packageName', 'asyncapi.models'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'golang', './test/specification.yml', `-o=${ path.resolve(outputDir, './go')}`])
      .it('fails when no package defined', (ctx, done) => {
        expect(ctx.stderr).toEqual('Error: In order to generate models to Go, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.\n');
        expect(ctx.stdout).toEqual('');
        done();
      });
  });

  describe('for Kotlin', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'kotlin', './test/specification.yml', `-o=${ path.resolve(outputDir, './kotlin')}`, '--packageName', 'asyncapi.models'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'kotlin', './test/specification.yml', `-o=${ path.resolve(outputDir, './kotlin')}`])
      .it('fails when no package defined', (ctx, done) => {
        expect(ctx.stderr).toEqual('Error: In order to generate models to Kotlin, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.\n');
        expect(ctx.stdout).toEqual('');
        done();
      });
  });

  describe('for Dart', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'dart', './test/specification.yml', `-o=${ path.resolve(outputDir, './dart')}`, '--packageName', 'asyncapi.models'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'dart', './test/specification.yml', `-o=${ path.resolve(outputDir, './dart')}`])
      .it('fails when no package defined', (ctx, done) => {
        expect(ctx.stderr).toEqual('Error: In order to generate models to Dart, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.\n');
        expect(ctx.stdout).toEqual('');
        done();
      });
  });

  describe('for PHP', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'php', './test/specification.yml', `-o=${ path.resolve(outputDir, './php')}`, '--namespace=\'asyncapi.models\''])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toContain(
          'Successfully generated the following models: '
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'php', './test/specification.yml', `-o=${ path.resolve(outputDir, './php')}`])
      .it('fails when no namespace defined', (ctx, done) => {
        expect(ctx.stderr).toEqual('Error: In order to generate models to PHP, we need to know which namespace they are under. Add `--namespace=NAMESPACE` to set the desired namespace.\n');
        expect(ctx.stdout).toEqual('');
        done();
      });
  });
  describe('with logging diagnostics', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'typescript', 'http://localhost:8080/streetlights.yml', '--log-diagnostics'])
      .it('works with remote AsyncAPI files', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toMatch('URL http://localhost:8080/streetlights.yml is valid but has (itself and/or referenced documents) governance issues.');
        done();
      });
  });
});
