import { expect, test } from '@oclif/test';
// eslint-disable-next-line
// @ts-ignore
import rimraf from 'rimraf';
import path from 'path';
import * as fs from 'fs';

const generalOptions = ['generate:template', './test/specification.yml', './test/minimaltemplate'];

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
    .it('should generate tempalte from local directory', (ctx, done) => {
      expect(ctx.stdout).to.contain('Check out your shiny new generated files at ./test/docs.\n\n');
      cleanup('./test/docs');
      done();
    });

  test
    .timeout(300000)
    .stdout()
    .command([
      'generate:template', 
      './test/specification.yml',
      '@asyncapi/html-template',
      '--output=./test/docs',
      '--force-write'
    ])
    .it('should generate template from remote', (ctx, done) => {
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
      '-p=customParam=\'Hello From Custom Param\'',
      '--output=./test/doc',
      '--force-write'
    ])
    .it('shoudld pass custom param in the template', (ctx, done) => {
      const generatedFile = fs.readFileSync(path.resolve('./test/doc/asyncapi.md'), { encoding: 'utf-8' });
      expect(ctx.stdout).to.contain('Check out your shiny new generated files at ./test/doc.\n\n');
      expect(generatedFile).to.contain('Hello From Custom Param');
      cleanup('./test/doc');
      done();
    });

  test
    .stdout()
    .command([
      ...generalOptions,
      '--output=./test/docs',
      '-d=generate:before'
    ])
    .it('should disable before hooks', (ctx, done) => {
      expect(ctx.stdout).to.contain('Check out your shiny new generated files at ./test/docs.\n\n');
      cleanup('./test/docs');
      done();
    });
});
