import * as fs from 'fs';
import * as path from 'path';
import { test } from '@oclif/test';
import rimraf from 'rimraf';
import { expect } from '@oclif/test';

const nonInteractive = '--no-interactive';

const generalOptions = [
  'generate:fromTemplate',
  './test/fixtures/specification.yml',
  '@asyncapi/minimaltemplate',
];
const asyncapiv3 = './test/fixtures/specification-v3.yml';

function cleanup(filepath: string) {
  try {
    rimraf.sync(filepath);
  } catch (error) {
    console.error(`Failed to clean up ${filepath}:`, error);
  }
}

describe('template', function () {
  this.timeout(200000); // Global timeout for all tests in this suite

  after(() => {
    cleanup('./test/docs');
  });

  test
    .stdout()
    .command([...generalOptions, '--output=./test/docs/1', '--force-write', '--no-interactive'])
    .it('should generate minimal template', async (ctx) => {
      console.log(ctx.stdout);
      expect(ctx.stdout).to.contain(
        'Check out your shiny new generated files at ./test/docs/1.\n\n'
      );
      cleanup('./test/docs/1');
    });

  describe('should handle AsyncAPI v3 document correctly', () => {
    test
      .stderr()
      .stdout()
      .command([
        'generate:fromTemplate',
        asyncapiv3,
        '@asyncapi/minimaltemplate',
        nonInteractive,
      ])
      .it('give error on disabled template', async (ctx) => {
        expect(ctx.stderr).to.equal(
          'Error: @asyncapi/minimaltemplate template does not support AsyncAPI v3 documents, please checkout some link\n'
        );
        expect(ctx.stdout).to.equal('');
      });
  });

  describe('should be able to use the new generator', () => {
    test
      .stderr()
      .stdout()
      .command([
        'generate:fromTemplate',
        './test/fixtures/asyncapi_v2.yml',
        '@asyncapi/newtemplate',
        '--output=./test/docs/2',
        '--force-write',
        '--use-new-generator',
      ])
      .it('should be able to generate using newer version of generator', async (ctx) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new generated files at ./test/docs/2.\n\n'
        );
        cleanup('./test/docs/2');
      });
  });

  describe('git clash', () => {
    const pathToOutput = './test/docs/2';
    before(() => {
      fs.mkdirSync(pathToOutput, { recursive: true });
      fs.writeFileSync(path.join(pathToOutput, 'random.md'), ''); // Trigger unstaged changes
    });

    test
      .stderr()
      .command([...generalOptions, `--output=${pathToOutput}`, nonInteractive])
      .it('should throw error if output folder is in a git repository', async (ctx) => {
        expect(ctx.stderr).to.contain(
          `Error: "${pathToOutput}" is in a git repository with unstaged changes.`
        );
        cleanup(pathToOutput);
      });
  });

  describe('custom params', () => {
    test
      .stdout()
      .command([
        ...generalOptions,
        '-p=version=1.0.0 mode=development',
        '--output=./test/docs/3',
        '--force-write',
        nonInteractive,
      ])
      .it('should pass custom param in the template', async (ctx) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new generated files at ./test/docs/3.\n\n'
        );
        cleanup('./test/docs/3');
      });
  });

  describe('disable-hooks', () => {
    test
      .stdout()
      .command([
        ...generalOptions,
        '--output=./test/docs/4',
        '--force-write',
        '-d=generate:after',
        nonInteractive,
      ])
      .it('should not create asyncapi.yaml file', async () => {
        const exists = fs.existsSync(path.resolve('./docs/asyncapi.yaml'));
        expect(!!exists).to.equal(false);
        cleanup('./test/docs/4');
      });
  });

  describe('debug', () => {
    test
      .stdout()
      .command([
        ...generalOptions,
        '--output=./test/docs/5',
        '--force-write',
        '--debug',
        nonInteractive,
      ])
      .it('should print debug logs', async (ctx) => {
        expect(ctx.stdout).to.contain(
          `Template sources taken from ${path.resolve('./test/fixtures/minimaltemplate')}.`
        );
        cleanup('./test/docs/5');
      });
  });

  describe('no-overwrite', () => {
    test
      .stdout()
      .command([
        ...generalOptions,
        '--output=./test/docs/6',
        '--force-write',
        '--no-overwrite=./test/docs/asyncapi.md',
        nonInteractive,
      ])
      .it('should skip the filepath and generate normally', async (ctx) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new generated files at ./test/docs/6.\n\n'
        );
        cleanup('./test/docs/6');
      });
  });

  describe('should install template', () => {
    test
      .stdout()
      .command([
        'generate:fromTemplate',
        './test/fixtures/specification.yml',
        './test/fixtures/minimaltemplate',
        '--install',
        '--force-write',
        '--output=./test/docs/7',
      ])
      .it('should install template', async (ctx) => {
        expect(ctx.stdout).to.contain(
          'Template installation started because you passed --install flag.'
        );
        cleanup('./test/docs/7');
      });
  });

  describe('map-base-url', () => {
    test
      .stdout()
      .command([
        'generate:fromTemplate',
        './test/fixtures/dummyspec/apiwithref.json',
        '@asyncapi/minimaltemplate',
        '--output=./test/docs/8',
        '--force-write',
        '--map-base-url=https://schema.example.com/crm/:./test/fixtures/dummyspec',
      ])
      .it('should resolve reference and generate from template', async (ctx) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new generated files at ./test/docs/8.\n\n'
        );
        cleanup('./test/docs/8');
      });
  });
});
