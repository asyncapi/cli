import { expect, test } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import { fileCleanup } from '../../helpers';

const spec = fs.readFileSync('./test/integration/bundle/final-asyncapi.yaml', { encoding: 'utf-8' });

function validateGeneratedSpec(filePath: string, expectedSpec: string) {
  const generatedSpec = fs.readFileSync(path.resolve(filePath), { encoding: 'utf-8' });
  if (generatedSpec !== expectedSpec) {
    throw new Error(`Generated spec does not match expected spec at ${filePath}`);
  }
}

describe('bundle', function () {
  this.timeout(200000); // Global timeout for all tests in this suite

  describe('bundle successful', () => {
    test
      .stdout()
      .command([
        'bundle',
        './test/integration/bundle/first-asyncapi.yaml',
        '--output=./test/integration/bundle/final.yaml',
      ])
      .it('should successfully bundle specification', async (ctx) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new bundled files at ./test/integration/bundle/final.yaml'
        );
        fileCleanup('./test/integration/bundle/final.yaml');
      });
  });

  describe('bundle into json file', () => {
    test
      .stdout()
      .command([
        'bundle',
        './test/integration/bundle/first-asyncapi.yaml',
        '--output=./test/integration/bundle/final.json',
      ])
      .it('should successfully bundle specification into json file', async (ctx) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new bundled files at ./test/integration/bundle/final.json'
        );
        fileCleanup('./test/integration/bundle/final.json');
      });
  });

  describe('when file path is wrong', () => {
    test
      .stderr()
      .command(['bundle', './test/integration/bundle/asyncapi.yml'])
      .it('should throw error message if the file path is wrong', async (ctx) => {
        expect(ctx.stderr).to.contain('Error: ENOENT: no such file or directory');
      });
  });

  describe('with custom reference', () => {
    test
      .stdout()
      .command([
        'bundle',
        './test/integration/bundle/first-asyncapi.yaml',
        './test/integration/bundle/feature.yaml',
        '--output=test/integration/bundle/final.yaml',
      ])
      .it('should be able to bundle multiple specs along with custom reference', async (ctx) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new bundled files at test/integration/bundle/final.yaml\n'
        );
        validateGeneratedSpec('test/integration/bundle/final.yaml', spec);
        fileCleanup('./test/integration/bundle/final.yaml');
      });
  });

  describe('with base file', () => {
    test
      .stdout()
      .command([
        'bundle',
        './test/integration/bundle/first-asyncapi.yaml',
        './test/integration/bundle/feature.yaml',
        '--output=test/integration/bundle/final.yaml',
        '--base=./test/integration/bundle/first-asyncapi.yaml',
      ])
      .it('should be able to bundle correctly with overwriting base file', async (ctx) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new bundled files at test/integration/bundle/final.yaml\n'
        );
        validateGeneratedSpec('test/integration/bundle/final-asyncapi.yaml', spec);
        fileCleanup('./test/integration/bundle/final.yaml');
      });
  });
});

describe('bundle, with spec v3', function () {
  this.timeout(200000); // Set timeout for this specific describe block

  test
    .stdout()
    .command([
      'bundle',
      './test/integration/bundle/first-asyncapiv3.yaml',
      '--output=test/integration/bundle/final.yaml',
    ])
    .it('should be able to bundle v3 spec correctly', async (ctx) => {
      expect(ctx.stdout).to.contain(
        'Check out your shiny new bundled files at test/integration/bundle/final.yaml\n'
      );
      fileCleanup('./test/integration/bundle/final.yaml');
    });
});
