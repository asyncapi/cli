/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/no-identical-functions */
import { expect, test } from '@oclif/test';
import * as path from 'path';

describe('types', () => {
  const generalOptions = ['-f', './test/specification.yml', '--outputDirectory'];
  const outputDir = './test/types';
  test
    .stderr()
    .stdout()
    .command(['types', '--language', 'random', ...generalOptions, path.resolve(outputDir, './random')])
    .it('fails when it dont know the language', (ctx, done) => {
      expect(ctx.stderr).to.equals('Error: Expected --language=random to be one of: typescript, csharp, golang, java, javascript\nSee more help with --help\n');
      expect(ctx.stdout).to.equals('');
      done();
    });
  describe('for TypeScript', () => {  
    test
      .stderr()
      .stdout()
      .command(['types', '--language', 'typescript', ...generalOptions, path.resolve(outputDir, './ts')])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).to.equals('');
        expect(ctx.stdout).to.equals(
          'We successfully generated the following models AnonymousSchema_1\n'
        );
        done();
      });
  });
  describe('for JavaScript', () => {  
    test
      .stderr()
      .stdout()
      .command(['types', '--language', 'javascript', ...generalOptions, path.resolve(outputDir, './js')])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.equals(
          'We successfully generated the following models AnonymousSchema_1\n'
        );
        expect(ctx.stderr).to.equals('');
        done();
      });
  });
  describe('for C#', () => {  
    test
      .stderr()
      .stdout()
      .command(['types', '--language', 'csharp', ...generalOptions, path.resolve(outputDir, './csharp'), '--csharpNamespace', 'test.namespace'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).to.equals('');
        expect(ctx.stdout).to.equals(
          'We successfully generated the following models AnonymousSchema_1\n'
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command(['types', '--language', 'csharp', ...generalOptions, path.resolve(outputDir, './csharp')])
      .it('fails when no namespace provided', (ctx, done) => {
        expect(ctx.stderr).to.equals('Error: Missing namespace option. Add `--csharpNamespace NAMESPACE` to set the desired namespace.\n');
        expect(ctx.stdout).to.equals('');
        done();
      });
  });
  describe('for Java', () => {  
    test
      .stderr()
      .stdout()
      .command(['types', '--language', 'java', ...generalOptions, path.resolve(outputDir, './java'), '--javaPackageName', 'test.package'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).to.equals('');
        expect(ctx.stdout).to.equals(
          'We successfully generated the following models AnonymousSchema_1\n'
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command(['types', '--language', 'java', ...generalOptions, path.resolve(outputDir, './java')])
      .it('fails when no package defined', (ctx, done) => {
        expect(ctx.stderr).to.equals('Error: Missing package name option. Add `--javaPackageName PACKAGENAME` to set the desired package name.\n');
        expect(ctx.stdout).to.equals('');
        done();
      });
  });
  describe('for Go', () => {  
    test
      .stderr()
      .stdout()
      .command(['types', '--language', 'golang', ...generalOptions, path.resolve(outputDir, './go'), '--goPackageName', 'test.package'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).to.equals('');
        expect(ctx.stdout).to.equals(
          'We successfully generated the following models AnonymousSchema1\n'
        );
        done();
      });
    test
      .stderr()
      .stdout()
      .command(['types', '--language', 'golang', ...generalOptions, path.resolve(outputDir, './go')])
      .it('fails when no ', (ctx, done) => {
        expect(ctx.stderr).to.equals('Error: Missing package name option. Add `--goPackageName PACKAGENAME` to set the desired package name.\n');
        expect(ctx.stdout).to.equals('');
        done();
      });
  });
});
