import { expect, test } from '@oclif/test';
// eslint-disable-next-line
// @ts-ignore
import rimraf from 'rimraf';

const generalOptions = ['generate:template']

const cleanup = async (filepath: string) => {
  rimraf.sync(filepath);
}

describe('template', () => {
  test
    .stdout()
    .command([
      ...generalOptions,
      './test/specification.yml',
      '@asyncapi/html-template',
      '--output=./test/docs',
      '--force-write'
    ])
    .it('should generate html tempalte', (ctx, done) => {
      expect(ctx.stdout).to.contain('Check out your shiny new generated files at ./test/docs.\n\n');
      cleanup('./test/docs');
      done();
    });

  test
    .stderr()
    .command([
      ...generalOptions,
      './test/specification.yml',
      '@asyncapi/html-template',
      '--output=./test/doc'
    ])
    .it('should throw error if output folder is in a git repository', (ctx, done) => {
      expect(ctx.stderr).to.contain('Error: "./test/doc" is in a git repository with unstaged changes.')
      cleanup('./test/doc');
      done();
    })

    test
      .stderr()
      .command([
        ...generalOptions,
        './test/specification.yml',
        '@asyncapi/html-template',
      ])
      .it('should throw error if --output flag is not specified', (ctx, done) => {
        expect(ctx.stderr).to.contain('Error: Missing required flag:')
        done();
      })

      test
        .stdout()
        .command([
          ...generalOptions,
          './test/specification.yml',
          './test/minimaltemplate',
          "-p=customParam='Hello From Custom Param'",
          '--output=./test/docs'
        ])
        .it('shoudld pass custom param in the template', (ctx, done) => {
          expect(ctx.stdout).to.contain('Check out your shiny new generated files at ./test/docs.\n\n');
          cleanup('./test/docs');
          done();
        })
});
