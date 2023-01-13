import * as fs from 'fs';
import * as path from 'path';
import { test } from '@oclif/test';
import rimraf from 'rimraf';

const generalOptions = [
  'generate:fromTemplate',
  './test/specification.yml',
  '@asyncapi/minimaltemplate',
];

async function cleanup(filepath: string) {
  rimraf.sync(filepath);
}

describe('template', () => {
  test
    .stdout()
    .command([...generalOptions, '--output=./test/docs', '--force-write'])
    .it('should generate minimal tempalte', (ctx, done) => {
      expect(ctx.stdout).toContain(
        'Check out your shiny new generated files at ./test/docs.\n\n'
      );
      cleanup('./test/docs');
      done();
    });

  test
    .do(() => {
      fs.writeFileSync('emptyFile.txt','');
    })
    .stderr()
    .command([...generalOptions, '--output=./test/doc'])
    .it(
      'should throw error if output folder is in a git repository',
      (ctx, done) => {
        expect(ctx.stderr).toContain(
          'Generator Error'
        );
        rimraf.sync('./test/doc');
        fs.unlinkSync('emptyFile.txt');
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
      expect(ctx.stdout).toContain(
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
      .it('should not create asyncapi.yaml file', (_, done) => {
        const exits = fs.existsSync(path.resolve('./docs/asyncapi.yaml'));
        expect(exits).toBeFalsy();
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
        expect(ctx.stdout).toContain(
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
        expect(ctx.stdout).toContain(
          'Check out your shiny new generated files at ./test/docs.\n\n'
        );
        cleanup('./test/docs');
        done();
      });
  });

  describe('install', () => {
    jest.setTimeout(100000);

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
      .it('should install template', (ctx, done) => {
        expect(ctx.stdout).toContain('Template installation started because you passed --install flag.');
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
          expect(ctx.stdout).toContain(
            'Check out your shiny new generated files at ./test/docs.\n\n'
          );
          cleanup('./test/docs');
          done();
        }
      );
  });
});
