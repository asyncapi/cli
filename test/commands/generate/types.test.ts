/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/no-identical-functions */
import { expect, test } from '@oclif/test';
import * as path from 'path';

const generalOptions = ['generate:types'];
const outputDir = './test/commands/generate/types';

describe('types', () => {
  test
    .stderr()
    .stdout()
    .command([...generalOptions, 'random', './test/specification.yml', `-o=${ path.resolve(outputDir, './random')}`])
    .it('fails when it dont know the language', (ctx, done) => {
      expect(ctx.stderr).to.equals('Error: Expected random to be one of: typescript, csharp, golang, java, javascript\nSee more help with --help\n');
      expect(ctx.stdout).to.equals('');
      done();
    });

  describe('for TypeScript', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'typescript', './test/specification.yml', `-o=${ path.resolve(outputDir, './ts')}`])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).to.equals('');
        expect(ctx.stdout).to.equals(
          'Successfully generated the following models AnonymousSchema_1\n'
        );
        done();
      });
  });

  describe('for JavaScript', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'javascript', './test/specification.yml', `-o=${ path.resolve(outputDir, './js')}`])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.equals(
          'Successfully generated the following models AnonymousSchema_1\n'
        );
        expect(ctx.stderr).to.equals('');
        done();
      });
  });

  describe('for C#', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${path.resolve(outputDir, './csharp')}`, '--namespace=\'test.namespace\''])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).to.equals('');
        expect(ctx.stdout).to.equals(
          'Successfully generated the following models AnonymousSchema_1\n'
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${ path.resolve(outputDir, './csharp')}`])
      .it('fails when no namespace provided', (ctx, done) => {
        expect(ctx.stderr).to.equals('Error: In order to generate types to C#, we need to know which namespace they are under. Add `--namespace=NAMESPACE` to set the desired namespace.\n');
        expect(ctx.stdout).to.equals('');
        done();
      });
  });

  describe('for Java', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'java', './test/specification.yml', `-o=${ path.resolve(outputDir, './java')}`, '--packageName', 'test.package'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).to.equals('');
        expect(ctx.stdout).to.equals(
          'Successfully generated the following models AnonymousSchema_1\n'
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'java', './test/specification.yml', `-o=${ path.resolve(outputDir, './java')}`])
      .it('fails when no package defined', (ctx, done) => {
        expect(ctx.stderr).to.equals('Error: In order to generate types to Java, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.\n');
        expect(ctx.stdout).to.equals('');
        done();
      });
  });

  describe('for Go', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'golang', './test/specification.yml', `-o=${ path.resolve(outputDir, './go')}`, '--packageName', 'test.package'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).to.equals('');
        expect(ctx.stdout).to.equals(
          'Successfully generated the following models AnonymousSchema1\n'
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'golang', './test/specification.yml', `-o=${ path.resolve(outputDir, './go')}`])
      .it('fails when no package defined', (ctx, done) => {
        expect(ctx.stderr).to.equals('Error: In order to generate types to Go, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.\n');
        expect(ctx.stdout).to.equals('');
        done();
      });
  });
});
