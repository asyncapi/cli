/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/no-identical-functions */
import path from 'path';
import { test } from '@oclif/test';
const generalOptions = ['generate:models'];
const outputDir = './test/commands/generate/models';

describe('models', () => {
  test
    .stderr()
    .stdout()
    .command([...generalOptions, 'typescript', 'http://bit.ly/asyncapi'])
    .it('works with remote AsyncAPI files', (ctx, done) => {
      expect(ctx.stderr).toEqual('');
      expect(ctx.stdout).toEqual('Splitting model <anonymous-schema-6> since it should be on its own\nSuccessfully generated the following models: \n## Model name: LightMeasuredPayload\n\n\nclass LightMeasuredPayload {\n  private _lumens?: number;\n  private _sentAt?: string;\n  private _additionalProperties?: Map<String, object | string | number | Array<unknown> | boolean | null>;\n\n  constructor(input: {\n    lumens?: number,\n    sentAt?: string,\n  }) {\n    this._lumens = input.lumens;\n    this._sentAt = input.sentAt;\n  }\n\n  get lumens(): number | undefined { return this._lumens; }\n  set lumens(lumens: number | undefined) { this._lumens = lumens; }\n\n  get sentAt(): string | undefined { return this._sentAt; }\n  set sentAt(sentAt: string | undefined) { this._sentAt = sentAt; }\n\n  get additionalProperties(): Map<String, object | string | number | Array<unknown> | boolean | null> | undefined { return this._additionalProperties; }\n  set additionalProperties(additionalProperties: Map<String, object | string | number | Array<unknown> | boolean | null> | undefined) { this._additionalProperties = additionalProperties; }\n}\nexport default LightMeasuredPayload;\n\n  \n\n## Model name: TurnOnOffPayload\nimport AnonymousSchema_6 from \'./AnonymousSchema_6\';\n\nclass TurnOnOffPayload {\n  private _command?: AnonymousSchema_6;\n  private _sentAt?: string;\n  private _additionalProperties?: Map<String, object | string | number | Array<unknown> | boolean | null>;\n\n  constructor(input: {\n    command?: AnonymousSchema_6,\n    sentAt?: string,\n  }) {\n    this._command = input.command;\n    this._sentAt = input.sentAt;\n  }\n\n  get command(): AnonymousSchema_6 | undefined { return this._command; }\n  set command(command: AnonymousSchema_6 | undefined) { this._command = command; }\n\n  get sentAt(): string | undefined { return this._sentAt; }\n  set sentAt(sentAt: string | undefined) { this._sentAt = sentAt; }\n\n  get additionalProperties(): Map<String, object | string | number | Array<unknown> | boolean | null> | undefined { return this._additionalProperties; }\n  set additionalProperties(additionalProperties: Map<String, object | string | number | Array<unknown> | boolean | null> | undefined) { this._additionalProperties = additionalProperties; }\n}\nexport default TurnOnOffPayload;\n\n  \n\n## Model name: AnonymousSchema_6\n\n\nenum AnonymousSchema_6 {\n  ON = "on",\n  OFF = "off",\n}\nexport default AnonymousSchema_6;\n\n  \n\n## Model name: DimLightPayload\n\n\nclass DimLightPayload {\n  private _percentage?: number;\n  private _sentAt?: string;\n  private _additionalProperties?: Map<String, object | string | number | Array<unknown> | boolean | null>;\n\n  constructor(input: {\n    percentage?: number,\n    sentAt?: string,\n  }) {\n    this._percentage = input.percentage;\n    this._sentAt = input.sentAt;\n  }\n\n  get percentage(): number | undefined { return this._percentage; }\n  set percentage(percentage: number | undefined) { this._percentage = percentage; }\n\n  get sentAt(): string | undefined { return this._sentAt; }\n  set sentAt(sentAt: string | undefined) { this._sentAt = sentAt; }\n\n  get additionalProperties(): Map<String, object | string | number | Array<unknown> | boolean | null> | undefined { return this._additionalProperties; }\n  set additionalProperties(additionalProperties: Map<String, object | string | number | Array<unknown> | boolean | null> | undefined) { this._additionalProperties = additionalProperties; }\n}\nexport default DimLightPayload;\n\n  \n');
      done();
    });
    
  test
    .stderr()
    .stdout()
    .command([...generalOptions, 'random', './test/specification.yml', `-o=${ path.resolve(outputDir, './random')}`])
    .it('fails when it dont know the language', (ctx, done) => {
      expect(ctx.stderr).toEqual('Error: Expected random to be one of: typescript, csharp, golang, java, javascript, dart\nSee more help with --help\n');
      expect(ctx.stdout).toEqual('');
      done();
    });

  test
    .stderr()
    .stdout()
    .command([...generalOptions, 'typescript', './test/specification.yml'])
    .it('works when generating in memory', (ctx, done) => {
      expect(ctx.stderr).toEqual('');
      expect(ctx.stdout).toEqual('Successfully generated the following models: \n## Model name: AnonymousSchema_1\n\n\nclass AnonymousSchema_1 {\n  private _displayName?: string;\n  private _email?: string;\n  private _additionalProperties?: Map<String, object | string | number | Array<unknown> | boolean | null>;\n\n  constructor(input: {\n    displayName?: string,\n    email?: string,\n  }) {\n    this._displayName = input.displayName;\n    this._email = input.email;\n  }\n\n  get displayName(): string | undefined { return this._displayName; }\n  set displayName(displayName: string | undefined) { this._displayName = displayName; }\n\n  get email(): string | undefined { return this._email; }\n  set email(email: string | undefined) { this._email = email; }\n\n  get additionalProperties(): Map<String, object | string | number | Array<unknown> | boolean | null> | undefined { return this._additionalProperties; }\n  set additionalProperties(additionalProperties: Map<String, object | string | number | Array<unknown> | boolean | null> | undefined) { this._additionalProperties = additionalProperties; }\n}\nexport default AnonymousSchema_1;\n\n  \n');
      done();
    });
    
  describe('for TypeScript', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'typescript', './test/specification.yml', `-o=${ path.resolve(outputDir, './ts')}`])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toEqual(
          'Successfully generated the following models: AnonymousSchema_1\n'
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
        expect(ctx.stdout).toEqual(
          'Successfully generated the following models: AnonymousSchema_1\n'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('for Python', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'python', './test/specification.yml', `-o=${ path.resolve(outputDir, './js')}`])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toEqual(
          'Successfully generated the following models: AnonymousSchema_1\n'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('for Rust', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'rust', './test/specification.yml', `-o=${ path.resolve(outputDir, './js')}`])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toEqual(
          'Successfully generated the following models: AnonymousSchema_1\n'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('for C#', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'csharp', './test/specification.yml', `-o=${path.resolve(outputDir, './csharp')}`, '--namespace=\'test.namespace\''])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toEqual(
          'Successfully generated the following models: AnonymousSchema_1\n'
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
  });

  describe('for Java', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'java', './test/specification.yml', `-o=${ path.resolve(outputDir, './java')}`, '--packageName', 'test.package'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toEqual(
          'Successfully generated the following models: AnonymousSchema_1\n'
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
      .command([...generalOptions, 'golang', './test/specification.yml', `-o=${ path.resolve(outputDir, './go')}`, '--packageName', 'test.package'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toEqual(
          'Successfully generated the following models: AnonymousSchema1\n'
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

  describe('for Dart', () => {  
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'dart', './test/specification.yml', `-o=${ path.resolve(outputDir, './dart')}`, '--packageName', 'test.package'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stderr).toEqual('');
        expect(ctx.stdout).toEqual(
          'Successfully generated the following models: anonymous_schema_1\n'
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
});
