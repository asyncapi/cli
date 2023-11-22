import * as fs from 'fs';
import * as path from 'path';
import { test } from '@oclif/test';
import rimraf from 'rimraf';
import { expect } from '@oclif/test';
import { it } from 'mocha';

const generalOptions = [
  'generate:fromTemplate',
  './test/fixtures/specification.yml',
  '@asyncapi/minimaltemplate',
];
const asyncapiv3 = './test/fixtures/specification-v3.yml';

function cleanup(filepath: string) {
  rimraf.sync(filepath);
}

describe('template', () => {
  after(() => {
    cleanup('./test/docs');
  });
  test
    .stdout()
    .command([...generalOptions, '--output=./test/docs/1', '--force-write'])
    .it('should generate minimal template', (ctx, done) => {
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
        '@asyncapi/minimaltemplate'])
      .it('give error on disabled template', (ctx, done) => {
        expect(ctx.stderr).to.equal('Error: @asyncapi/minimaltemplate template does not support AsyncAPI v3 documents, please checkout some link\n');
        expect(ctx.stdout).to.equal('');
        done();
      });
  }).timeout(200000);

  describe('git clash', () => {
    const pathToOutput = './test/docs/2';
    before(() => {
      fs.mkdirSync(pathToOutput, { recursive: true });
      // Write a random file to trigger that dir has unstaged changes.
      fs.writeFileSync(path.join(pathToOutput, 'random.md'), '');
    });
    test
      .stderr()
      .command([...generalOptions, '--output=./test/docs/2'])
      .it(
        'should throw error if output folder is in a git repository',
        (ctx, done) => {
          expect(ctx.stderr).to.contain(
            'Error: "./test/docs/2" is in a git repository with unstaged changes.'
          );
          cleanup('./test/docs/2');
          done();
        }
      );
  });

  test
    .stdout()
    .command([
      ...generalOptions,
      '-p=version=1.0.0 mode=development',
      '--output=./test/docs/3',
      '--force-write',
    ])
    .it('should pass custom param in the template', (ctx, done) => {
      expect(ctx.stdout).to.contain(
        'Check out your shiny new generated files at ./test/docs/3.\n\n'
      );
      cleanup('./test/docs/3');
      done();
    });

  describe('disable-hooks', () => {
    test
      .stdout()
      .command([
        ...generalOptions,
        '--output=./test/docs/4',
        '--force-write',
        '-d=generate:after',
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
      ])
      .it('should skip the filepath and generate normally', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new generated files at ./test/docs/6.\n\n'
        );
        cleanup('./test/docs/6');
        done();
      });
  });

  it('should install template', () => {
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
