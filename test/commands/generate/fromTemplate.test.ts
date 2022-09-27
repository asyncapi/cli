import { expect, test } from '@oclif/test';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line
// @ts-ignore
import rimraf from 'rimraf';

const generalOptions = [
  'generate:fromTemplate',
  './test/specification.yml',
  '@asyncapi/minimaltemplate',
];

const cleanup = async (filepath: string) => {
  rimraf.sync(filepath);
};

describe('template', () => {
  test
    .stdout()
    .command([...generalOptions, '--output=./test/docs', '--force-write'])
    .it('should generate minimal tempalte', (ctx, done) => {
      expect(ctx.stdout).to.contain(
        'Check out your shiny new generated files at ./test/docs.\n\n'
      );
      cleanup('./test/docs');
      done();
    });

  test
    .stderr()
    .command([...generalOptions, '--output=./test/doc'])
    .it(
      'should throw error if output folder is in a git repository',
      (ctx, done) => {
        expect(ctx.stderr).to.contain(
          'Error: "./test/doc" is in a git repository with unstaged changes.'
        );
        cleanup('./test/doc');
        done();
      }
    );

  test
    .stdout()
    .command([
      ...generalOptions,
      '-p=version=1.0.0 mode=development',
      '--output=./test/docs',
      '--force-write',
    ])
    .it('shoudld pass custom param in the template', (ctx, done) => {
      expect(ctx.stdout).to.contain(
        'Check out your shiny new generated files at ./test/docs.\n\n'
      );
      cleanup('./test/docs');
      done();
    });

  describe('disable-hooks', () => {
    test
      .stdout()
      .command([
        ...generalOptions,
        '--output=./test/docs',
        '--force-write',
        '-d=generate:after',
      ])
      .it('should not create asyncapi.yaml file', (ctx, done) => {
        const exits = fs.existsSync(path.resolve('./docs/asyncapi.yaml'));
        expect(exits).to.be.false; /* eslint-disable-line */
        cleanup('./test/docs');
        done();
      });
  });

  describe('debug', () => {
    test
      .stdout()
      .command([
        ...generalOptions,
        '--output=./test/docs',
        '--force-write',
        '--debug',
      ])
      .it('should print debug logs', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          `Template sources taken from ${path.resolve(
            './test/minimaltemplate'
          )}.`
        );
        cleanup('./test/docs');
        done();
      });
  });

  describe('no-overwrite', () => {
    test
      .stdout()
      .command([
        ...generalOptions,
        '--output=./test/docs',
        '--force-write',
        '--no-overwrite=./test/docs/asyncapi.md',
      ])
      .it('should skip the filepath and generate normally', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new generated files at ./test/docs.\n\n'
        );
        cleanup('./test/docs');
        done();
      });
  });

  describe('install', () => {
    test
      .stdout()
      .command([
        'generate:fromTemplate',
        './test/specification.yml',
        './test/minimaltemplate',
        '--install',
        '--force-write',
        '--output=./test/docs'
      ])
      .timeout(100000)
      .it('should install template', (ctx, done) => {
        expect(ctx.stdout).to.contain('Template installation started because you passed --install flag.');
        cleanup('./test/docs');
        done();
      });
  });

  describe('map-base-url', () => {
    test
      .stdout()
      .command([
        'generate:fromTemplate',
        './test/dummyspec/apiwithref.json',
        '@asyncapi/minimaltemplate',
        '--output=./test/docs',
        '--force-write',
        '--map-base-url=https://schema.example.com/crm/:./test/dummyspec',
      ])
      .it(
        'should resolve reference and generate from template',
        (ctx, done) => {
          expect(ctx.stdout).to.contain(
            'Check out your shiny new generated files at ./test/docs.\n\n'
          );
          cleanup('./test/docs');
          done();
        }
      );
  });
});
