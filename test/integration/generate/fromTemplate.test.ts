import * as fs from 'fs';
import * as path from 'path';
import { test } from '@oclif/test';
import { rimrafSync } from 'rimraf';
import { expect } from '@oclif/test';

const nonInteractive = '--no-interactive';

const generalOptions = [
  'generate:fromTemplate',
  './test/fixtures/specification.yml',
  '@asyncapi/minimaltemplate',
];
const asyncapiv3 = './test/fixtures/specification-v3.yml';

function cleanup(filepath: string) {
  rimrafSync(filepath);
}

describe('template', () => {
  after(() => {
    cleanup('./test/docs');
  });
  test
    .stdout()
    .command([...generalOptions, '--output=./test/docs/1', '--force-write', '--no-interactive'])
    .it('should generate minimal template', (ctx, done) => {
      console.log(ctx.stdout);
      expect(ctx.stdout).to.contain(
        'Check out your shiny new generated files at ./test/docs/1.\n\n'
      );
      cleanup('./test/docs/1');
      done();
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
      .it('give error on disabled template', (ctx, done) => {
        expect(ctx.stderr).to.contain('Error: @asyncapi/minimaltemplate template does not support AsyncAPI v3 documents, please checkout some link\n');
        expect(ctx.stdout).to.equal('');
        done();
      });
  }).timeout(200000);

  describe('should be able to generate from template', () => {
    test
      .stderr()
      .stdout()
      .command([
        'generate:fromTemplate',
        './test/fixtures/asyncapi_v2.yml',
        '@asyncapi/newtemplate',
        '--output=./test/docs/2',
        '--force-write',
      ])
      .it('should be able to generate using the generator', (ctx, done) => {
        expect(ctx.stdout).to.contain('Check out your shiny new generated files at ./test/docs/2.\n\n');
        cleanup('./test/docs/2');
        done();
      });
  });

  describe('should error out on proxy port', () => {
    test
      .stderr()
      .stdout()
      .command([
        'generate:fromTemplate',
        'http://localhost:8080/dummySpec.yml',
        '@asyncapi/newtemplate',
        '--output=./test/docs/2',
        '--force-write',
        '--proxyHost=host',
        '--proxyPort=8080',
      ])
      .it('should throw error when url is passed with proxyHost and proxyPort with invalid host', (ctx, done) => {
        expect(ctx.stdout).to.contain('');
        expect(ctx.stderr).to.equal('error loading AsyncAPI document from url: Failed to download http://localhost:8080/dummySpec.yml.\n');
        cleanup('./test/docs/2');
        done();
      });
  });

  describe('git clash', () => {
    const pathToOutput = './test/docs/2';
    before(() => {
      fs.mkdirSync(pathToOutput, { recursive: true });
      // Write a random file to trigger that dir has unstaged changes.
      fs.writeFileSync(path.join(pathToOutput, 'random.md'), '');
    });
    test
      .stderr()
      .command([...generalOptions, `--output=${pathToOutput}`, nonInteractive])
      .it(
        'should throw error if output folder is in a git repository',
        (ctx, done) => {
          expect(ctx.stderr).to.contain(
            `Error: "${pathToOutput}" is in a git repository with unstaged changes.`
          );
          cleanup(pathToOutput);
          done();
        }
      );
  });

  describe('custom params', () => {
    test
      .stdout()
      .command([
        ...generalOptions,
        '-p=version=1.0.0 mode=development',
        '--output=./test/docs/3',
        '--force-write',
        nonInteractive
      ])
      .it('should pass custom param in the template', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new generated files at ./test/docs/3.\n\n'
        );
        cleanup('./test/docs/3');
        done();
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
        nonInteractive
      ])
      .it('should not create asyncapi.yaml file', async (_, done) => {
        const exits = fs.existsSync(path.resolve('./docs/asyncapi.yaml'));
        expect(!!exits).to.equal(false);
        cleanup('./test/docs/4');
        done();
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
        nonInteractive
      ])
      .it('should print debug logs', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          `Template sources taken from ${path.resolve(
            './test/fixtures/minimaltemplate'
          )}.`
        );
        cleanup('./test/docs/5');
        done();
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
        nonInteractive
      ])
      .it('should skip the filepath and generate normally', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new generated files at ./test/docs/6.\n\n'
        );
        cleanup('./test/docs/6');
        done();
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
        '--output=./test/docs/7'
      ])
      .it('should install template', (ctx, done) => {
        expect(ctx.stdout).to.contain('Template installation started because you passed --install flag.');
        cleanup('./test/docs/7');
        done();
      });
  }).timeout(1000000);

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
      .it(
        'should resolve reference and generate from template',
        (ctx, done) => {
          expect(ctx.stdout).to.contain(
            'Check out your shiny new generated files at ./test/docs/8.\n\n'
          );
          cleanup('./test/docs/8');
          done();
        }
      );
  });
});
