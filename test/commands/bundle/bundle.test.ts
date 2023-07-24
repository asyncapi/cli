import { test } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import { fileCleanup } from '../../testHelper';

const spec = fs.readFileSync('./test/commands/bundle/final-asyncapi.yaml', {encoding: 'utf-8'});
const asyncapiv3 = './test/specification-v3.yml';

function validateGeneratedSpec(filePath, spec) {
  const generatedSPec = fs.readFileSync(path.resolve(filePath), { encoding: 'utf-8' });
  return generatedSPec === spec;
}

describe('bundle', () => {
  describe('should handle AsyncAPI v3 document correctly', () => {
    test
      .stderr()
      .stdout()
      .command([
        'bundle',
        asyncapiv3,
        '--output=./test/commands/bundle/final.yaml'])
      .it('give error', (ctx, done) => {
        expect(ctx.stderr).toEqual('Error: One of the files you tried to bundle is AsyncAPI v3 format, the bundle command does not support it yet, please checkout https://github.com/asyncapi/bundler/issues/133\n');
        expect(ctx.stdout).toEqual('');
        done();
      });
  });
  test
    .stdout()
    .command([
      'bundle', './test/commands/bundle/first-asyncapi.yaml',
      '--output=./test/commands/bundle/final.yaml',
    ])
    .it('should successfully bundle specification', (ctx, done) => {
      expect(ctx.stdout).toContain(
        'Check out your shiny new bundled files at ./test/commands/bundle/final.yaml'
      );
      fileCleanup('./test/commands/bundle/final.yaml');
      done();
    });

  test
    .stderr()
    .command([
      'bundle', './test/commands/bundle/asyncapi.yml'
    ])
    .it('should throw error message if the file path is wrong', (ctx, done) => {
      expect(ctx.stderr).toContain('error loading AsyncAPI document from file: ./test/commands/bundle/asyncapi.yml file does not exist.\n');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/commands/bundle/first-asyncapi.yaml', '--reference-into-components', '--output=test/commands/bundle/final.yaml'
    ])
    .it('should be able to refence messages into components', (ctx, done) => {
      expect(ctx.stdout).toContain('Check out your shiny new bundled files at test/commands/bundle/final.yaml\n');
      fileCleanup('./test/commands/bundle/final.yaml');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/commands/bundle/first-asyncapi.yaml', './test/commands/bundle/feature.yaml', '--reference-into-components', '--output=test/commands/bundle/final.yaml'
    ])
    .it('should be able to bundle multiple specs along with custom reference', (ctx, done) => {
      expect(ctx.stdout).toContain('Check out your shiny new bundled files at test/commands/bundle/final.yaml\n');
      expect(validateGeneratedSpec('test/commands/bundle/final.yaml', spec));
      fileCleanup('./test/commands/bundle/final.yaml');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/commands/bundle/first-asyncapi.yaml', './test/commands/bundle/feature.yaml', '--reference-into-components', '--output=test/commands/bundle/final.yaml', '--base=./test/commands/bundle/first-asyncapi.yaml'
    ])
    .it('should be able to bundle correctly with overwriting base file', (ctx, done) => {
      expect(ctx.stdout).toContain('Check out your shiny new bundled files at test/commands/bundle/final.yaml\n');
      expect(validateGeneratedSpec('test/commands/bundle/final-asyncapi.yaml', spec));
      fileCleanup('./test/commands/bundle/final.yaml');
      done();
    });
});
