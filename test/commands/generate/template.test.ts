import { expect, test } from '@oclif/test';
// eslint-disable-next-line
// @ts-ignore
import rimraf from 'rimraf';

const generalOptions = ['generate:template', './test/specification.yml', '@asyncapi/html-template'];

const cleanup = async (filepath: string) => {
  rimraf.sync(filepath);
};

describe('template', () => {
  test
    .stdout()
    .command([
      ...generalOptions,
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
      '--output=./test/doc'
    ])
    .it('should throw error if output folder is in a git repository', (ctx, done) => {
      expect(ctx.stderr).to.contain('Error: "./test/doc" is in a git repository with unstaged changes.');
      cleanup('./test/doc');
      done();
    });

  test
    .stdout()
    .command([
      ...generalOptions,
      '-p=version=\'1.0.0\'',
      '--output=./test/docs',
      '--force-write'
    ])
    .it('shoudld pass custom param in the template', (ctx, done) => {
      expect(ctx.stdout).to.contain('Check out your shiny new generated files at ./test/docs.\n\n');
      cleanup('./test/docs');
      done();
    });
});
