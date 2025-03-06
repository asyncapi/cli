import * as fs from 'fs';
import * as path from 'path';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';
import { rimraf } from 'rimraf';
import { createMockServer, stopMockServer } from '../../helpers';

const generalOptions = ['generate:models'];
const outputDir = './test/fixtures/generate/models';

describe('models', () => {
  before(() => {
    createMockServer();
  });

  after(() => {
    stopMockServer();
    rimraf.sync(outputDir);
  });

  it('works with remote AsyncAPI files', async () => {
    const { stdout, stderr } = await runCommand([
      ...generalOptions,
      'typescript',
      'http://localhost:8080/dummySpec.yml',
    ]);
    expect(stderr).to.equal('');
    expect(stdout).to.contain('Successfully generated the following models: ');
  });

  it('works when file path is passed without specified output directory', async () => {
    const { stdout, stderr } = await runCommand([
      ...generalOptions,
      'typescript',
      './test/fixtures/specification.yml',
    ]);
    expect(stderr).to.equal('');
    expect(stdout).to.match(/Successfully generated the following models:\s+## Model name:/);
  });

  it('works when file path is passed with specified output directory', async () => {
    const { stdout, stderr } = await runCommand([
      ...generalOptions,
      'typescript',
      './test/fixtures/specification.yml',
      `-o=${path.resolve(outputDir, './ts')}`,
    ]);
    expect(stderr).to.equal('');
    expect(stdout).to.contain('Successfully generated the following models: ');
  });

  it('should throw error when url is passed with proxyHost and proxyPort with invalid host', async () => {
    const { stdout, stderr } = await runCommand([
      ...generalOptions,
      'typescript',
      'http://localhost:8080/dummySpec.yml',
      '--proxyHost=host',
      '--proxyPort=8080',
    ]);
    expect(stdout).to.equal('');
    expect(stderr).to.equal('error loading AsyncAPI document from url: Failed to download http://localhost:8080/dummySpec.yml --proxyHost=host --proxyPort=8080.\n');
  });

  describe('with logging diagnostics', () => {
    it('works with remote AsyncAPI files', async () => {
      const { stdout, stderr } = await runCommand([
        ...generalOptions,
        'typescript',
        'http://localhost:8080/dummySpec.yml',
        '--log-diagnostics',
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.match(/URL http:\/\/localhost:8080\/dummySpec.yml is valid but has \(itself and\/or referenced documents\) governance issues./);
    });
  });
});
