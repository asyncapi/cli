import { test } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import { fileCleanup } from '../../../helpers';

const spec = fs.readFileSync('./test/functionality/commands/bundle/final-asyncapi.yaml', {encoding: 'utf-8'});

function validateGeneratedSpec(filePath, spec) {
  const generatedSPec = fs.readFileSync(path.resolve(filePath), { encoding: 'utf-8' });
  return generatedSPec === spec;
}

describe('bundle', () => {
  test
    .stdout()
    .command([
      'bundle', './test/functionality/commands/bundle/first-asyncapi.yaml',
      '--output=./test/functionality/commands/bundle/final.yaml',
    ])
    .it('should successfully bundle specification', (ctx, done) => {
      expect(ctx.stdout).toContain(
        'Check out your shiny new bundled files at ./test/functionality/commands/bundle/final.yaml'
      );
      fileCleanup('./test/functionality/commands/bundle/final.yaml');
      done();
    });

  test
    .stderr()
    .command([
      'bundle', './test/functionality/commands/bundle/asyncapi.yml'
    ])
    .it('should throw error message if the file path is wrong', (ctx, done) => {
      expect(ctx.stderr).toContain('error loading AsyncAPI document from file: ./test/functionality/commands/bundle/asyncapi.yml file does not exist.\n');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/functionality/commands/bundle/first-asyncapi.yaml', '--reference-into-components', '--output=./test/functionality/commands/bundle/final.yaml'
    ])
    .it('should be able to refence messages into components', (ctx, done) => {
      expect(ctx.stdout).toContain('Check out your shiny new bundled files at test/functionality/commands/bundle/final.yaml\n');
      fileCleanup('./test/functionality/commands/bundle/final.yaml');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/functionality/commands/bundle/first-asyncapi.yaml', './test/functionality/commands/bundle/feature.yaml', '--reference-into-components', '--output=test/functionality/commands/bundle/final.yaml'
    ])
    .it('should be able to bundle multiple specs along with custom reference', (ctx, done) => {
      expect(ctx.stdout).toContain('Check out your shiny new bundled files at test/functionality/commands/bundle/final.yaml\n');
      expect(validateGeneratedSpec('test/functionality/commands/bundle/final.yaml', spec));
      fileCleanup('./test/functionality/commands/bundle/final.yaml');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/functionality/commands/bundle/first-asyncapi.yaml', './test/functionality/commands/bundle/feature.yaml', '--reference-into-components', '--output=test/functionality/commands/bundle/final.yaml', '--base=./test/functionality/commands/bundle/first-asyncapi.yaml'
    ])
    .it('should be able to bundle correctly with overwriting base file', (ctx, done) => {
      expect(ctx.stdout).toContain('Check out your shiny new bundled files at test/functionality/commands/bundle/final.yaml\n');
      expect(validateGeneratedSpec('test/functionality/commands/bundle/final-asyncapi.yaml', spec));
      fileCleanup('./test/functionality/commands/bundle/final.yaml');
      done();
    });
});
