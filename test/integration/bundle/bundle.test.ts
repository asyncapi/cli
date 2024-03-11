import { expect, test } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import { fileCleanup } from '../../helpers';

const spec = fs.readFileSync('./test/integration/bundle/final-asyncapi.yaml', {encoding: 'utf-8'});

function validateGeneratedSpec(filePath: string, spec: string) {
  const generatedSPec = fs.readFileSync(path.resolve(filePath), { encoding: 'utf-8' });
  return generatedSPec === spec;
}

describe('bundle', () => {
  test
    .stdout()
    .command([
      'bundle', './test/integration/bundle/first-asyncapi.yaml',
      '--output=./test/integration/bundle/final.yaml',
    ])
    .it('should successfully bundle specification', (ctx, done) => {
      expect(ctx.stdout).to.contain(
        'Check out your shiny new bundled files at ./test/integration/bundle/final.yaml'
      );
      fileCleanup('./test/integration/bundle/final.yaml');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/integration/bundle/first-asyncapi.yaml',
      '--output=./test/integration/bundle/final.json'
    ])
    .it('should successfully bundle specification into json file', (ctx, done) => {
      expect(ctx.stdout).to.contain(
        'Check out your shiny new bundled files at ./test/integration/bundle/final.json'
      );
      fileCleanup('./test/integration/bundle/final.json');
      done();
    });

  test
    .stderr()
    .command([
      'bundle', './test/integration/bundle/asyncapi.yml'
    ])
    .it('should throw error message if the file path is wrong', (ctx, done) => {
      expect(ctx.stderr).to.contain('error loading AsyncAPI document from file: ./test/integration/bundle/asyncapi.yml file does not exist.\n');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/integration/bundle/first-asyncapi.yaml', '--reference-into-components', '--output=./test/integration/bundle/final.yaml'
    ])
    .it('should be able to refence messages into components', (ctx, done) => {
      expect(ctx.stdout).to.contain('Check out your shiny new bundled files at ./test/integration/bundle/final.yaml\n');
      fileCleanup('./test/integration/bundle/final.yaml');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/integration/bundle/first-asyncapi.yaml', './test/integration/bundle/feature.yaml', '--reference-into-components', '--output=test/integration/bundle/final.yaml'
    ])
    .it('should be able to bundle multiple specs along with custom reference', (ctx, done) => {
      expect(ctx.stdout).to.contain('Check out your shiny new bundled files at test/integration/bundle/final.yaml\n');
      expect(validateGeneratedSpec('test/integration/bundle/final.yaml', spec));
      fileCleanup('./test/integration/bundle/final.yaml');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/integration/bundle/first-asyncapi.yaml', './test/integration/bundle/feature.yaml', '--reference-into-components', '--output=test/integration/bundle/final.yaml', '--base=./test/integration/bundle/first-asyncapi.yaml'
    ])
    .it('should be able to bundle correctly with overwriting base file', (ctx, done) => {
      expect(ctx.stdout).to.contain('Check out your shiny new bundled files at test/integration/bundle/final.yaml\n');
      expect(validateGeneratedSpec('test/integration/bundle/final-asyncapi.yaml', spec));
      fileCleanup('./test/integration/bundle/final.yaml');
      done();
    });

});

describe('bundle spec v3', () => {
  test
    .stdout()
    .command([
      'bundle', './test/integration/bundle/first-asyncapiv3.yaml',
      '--output=test/integration/bundle/final.yaml',
    ]).it('should be able to bundle v3 spec correctly', (ctx, done) => {
      expect(ctx.stdout).to.contain('Check out your shiny new bundled files at test/integration/bundle/final.yaml\n')
      fileCleanup('./test/integration/bundle/final.yaml')
      done()
    })
})