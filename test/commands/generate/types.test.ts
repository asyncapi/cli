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

  test
    .stderr()
    .stdout()
    .command([...generalOptions, 'typescript', './test/specification.yml'])
    .it('works when generating in memory', (ctx, done) => {
      console.log(ctx.stdout);
      expect(ctx.stderr).to.equals('');
      expect(ctx.stdout).to.equals(`Successfully generated the following models: 
## Model name: AnonymousSchema_1


class AnonymousSchema_1 {
  private _displayName?: string;
  private _email?: string;
  private _additionalProperties?: Map<String, object | string | number | Array<unknown> | boolean | null>;

  constructor(input: {
    displayName?: string,
    email?: string,
  }) {
    this._displayName = input.displayName;
    this._email = input.email;
  }

  get displayName(): string | undefined { return this._displayName; }
  set displayName(displayName: string | undefined) { this._displayName = displayName; }

  get email(): string | undefined { return this._email; }
  set email(email: string | undefined) { this._email = email; }

  get additionalProperties(): Map<String, object | string | number | Array<unknown> | boolean | null> | undefined { return this._additionalProperties; }
  set additionalProperties(additionalProperties: Map<String, object | string | number | Array<unknown> | boolean | null> | undefined) { this._additionalProperties = additionalProperties; }
}
export default AnonymousSchema_1;
`);
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

  describe('for Dart', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'dart', './test/specification.yml', `-o=${ path.resolve(outputDir, './go')}`, '--packageName', 'test.package'])
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
      .command([...generalOptions, 'dart', './test/specification.yml', `-o=${ path.resolve(outputDir, './go')}`])
      .it('fails when no package defined', (ctx, done) => {
        expect(ctx.stderr).to.equals('Error: In order to generate types to Go, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.\n');
        expect(ctx.stdout).to.equals('');
        done();
      });
  });
});
