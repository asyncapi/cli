import * as fs from 'fs';
import * as path from 'path';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import { rimraf } from 'rimraf';

const nonInteractive = '--no-interactive';
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

  it('should generate minimal template', async () => {
    const { stdout, stderr } = await runCommand([
      ...generalOptions,
      '--output=./test/docs/1',
      '--force-write',
      nonInteractive,
    ]);
    expect(stderr).to.equal('');
    expect(stdout).to.contain('Check out your shiny new generated files at ./test/docs/1.\n\n');
    cleanup('./test/docs/1');
  });

  describe('should handle AsyncAPI v3 document correctly', () => {
    it('give error on disabled template', async () => {
      const { stdout, stderr } = await runCommand([
        'generate:fromTemplate',
        asyncapiv3,
        '@asyncapi/minimaltemplate',
        nonInteractive,
      ]);
      expect(stderr).to.equal('Error: @asyncapi/minimaltemplate template does not support AsyncAPI v3 documents, please checkout some link\n');
      expect(stdout).to.equal('');
    }).timeout(200000);
  });

  describe('should be able to use the new generator', () => {
    it('should be able to generate using newer version of generator', async () => {
      const { stdout, stderr } = await runCommand([
        'generate:fromTemplate',
        './test/fixtures/asyncapi_v2.yml',
        '@asyncapi/newtemplate',
        '--output=./test/docs/2',
        '--force-write',
        '--use-new-generator',
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain('Check out your shiny new generated files at ./test/docs/2.\n\n');
      cleanup('./test/docs/2');
    });
  });

  describe('should error out on proxy port', () => {
    it('should throw error when url is passed with proxyHost and proxyPort with invalid host', async () => {
      const { stdout, stderr } = await runCommand([
        'generate:fromTemplate',
        'http://localhost:8080/dummySpec.yml',
        '@asyncapi/newtemplate',
        '--output=./test/docs/2',
        '--force-write',
        '--proxyHost=host',
        '--proxyPort=8080',
        '--use-new-generator',
      ]);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('error loading AsyncAPI document from url: Failed to download http://localhost:8080/dummySpec.yml.\n');
      cleanup('./test/docs/2');
    });
  });

  describe('git clash', () => {
    const pathToOutput = './test/docs/2';
    before(() => {
      fs.mkdirSync(pathToOutput, { recursive: true });
      fs.writeFileSync(path.join(pathToOutput, 'random.md'), '');
    });

    it('should throw error if output folder is in a git repository', async () => {
      const { stdout, stderr } = await runCommand([
        ...generalOptions,
        `--output=${pathToOutput}`,
        nonInteractive,
      ]);
      expect(stderr).to.contain(`Error: "${pathToOutput}" is in a git repository with unstaged changes.`);
      cleanup(pathToOutput);
    });
  });

  describe('custom params', () => {
    it('should pass custom param in the template', async () => {
      const { stdout, stderr } = await runCommand([
        ...generalOptions,
        '-p=version=1.0.0 mode=development',
        '--output=./test/docs/3',
        '--force-write',
        nonInteractive,
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain('Check out your shiny new generated files at ./test/docs/3.\n\n');
      cleanup('./test/docs/3');
    });
  });

  describe('disable-hooks', () => {
    it('should not create asyncapi.yaml file', async () => {
      const { stdout, stderr } = await runCommand([
        ...generalOptions,
        '--output=./test/docs/4',
        '--force-write',
        '-d=generate:after',
        nonInteractive,
      ]);
      const exists = fs.existsSync(path.resolve('./docs/asyncapi.yaml'));
      expect(!!exists).to.equal(false);
      cleanup('./test/docs/4');
    });
  });

  describe('debug', () => {
    it('should print debug logs', async () => {
      const { stdout, stderr } = await runCommand([
        ...generalOptions,
        '--output=./test/docs/5',
        '--force-write',
        '--debug',
        nonInteractive,
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain(`Template sources taken from ${path.resolve('./test/fixtures/minimaltemplate')}.`);
      cleanup('./test/docs/5');
    });
  });

  describe('no-overwrite', () => {
    it('should skip the filepath and generate normally', async () => {
      const { stdout, stderr } = await runCommand([
        ...generalOptions,
        '--output=./test/docs/6',
        '--force-write',
        '--no-overwrite=./test/docs/asyncapi.md',
        nonInteractive,
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain('Check out your shiny new generated files at ./test/docs/6.\n\n');
      cleanup('./test/docs/6');
    });
  });

  describe('should install template', () => {
    it('should install template', async () => {
      const { stdout, stderr } = await runCommand([
        'generate:fromTemplate',
        './test/fixtures/specification.yml',
        './test/fixtures/minimaltemplate',
        '--install',
        '--force-write',
        '--output=./test/docs/7',
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain('Template installation started because you passed --install flag.');
      cleanup('./test/docs/7');
    }).timeout(1000000);
  });

  describe('map-base-url', () => {
    it('should resolve reference and generate from template', async () => {
      const { stdout, stderr } = await runCommand([
        'generate:fromTemplate',
        './test/fixtures/dummyspec/apiwithref.json',
        '@asyncapi/minimaltemplate',
        '--output=./test/docs/8',
        '--force-write',
        '--map-base-url=https://schema.example.com/crm/:./test/fixtures/dummyspec',
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.contain('Check out your shiny new generated files at ./test/docs/8.\n\n');
      cleanup('./test/docs/8');
    });
  });
});
