import { expect, test } from '@oclif/test';
import path from 'path';
import rimraf from 'rimraf';
import { createMockServer, stopMockServer } from '../../helpers';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
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

  test
    .stderr()
    .stdout()
    .command([...generalOptions, 'typescript', 'http://localhost:8080/dummySpec.yml'])
    .it('works with remote AsyncAPI files', (ctx, done) => {
      expect(ctx.stdout).to.contain(
        'Successfully generated the following models: '
      );
      done();
    });

  test
    .stderr()
    .stdout()
    .command([...generalOptions, 'typescript', './test/fixtures/specification.yml', `-o=${ path.resolve(outputDir, './ts')}`])
    .it('works when file path is passed', (ctx, done) => {
      expect(ctx.stdout).to.contain(
        'Successfully generated the following models: '
      );
      done();
    });

    describe('proxy-related tests', () => {
      test
        .stderr()
        .stdout()
        .env({ PROXY_HOST: '127.0.0.1', PROXY_PORT: '3128' }) // Mock environment variables for proxy
        .do(() => {
          process.env.PROXY_HOST = '127.0.0.1';
          process.env.PROXY_PORT = '3128';
        })
        .command([...generalOptions, 'typescript', 'http://localhost:8080/dummySpec.yml', '--proxyHost=127.0.0.1', '--proxyPort=3128'])
        .it('works with proxy settings', (ctx, done) => {
          expect(ctx.stdout).to.contain('Successfully generated the following models: ');
          expect(process.env.PROXY_HOST).to.equal('127.0.0.1');
          expect(process.env.PROXY_PORT).to.equal('3128');
          done();
        });
  
      test
        .stderr()
        .stdout()
        .command([...generalOptions, 'typescript', 'http://localhost:8080/dummySpec.yml'])
        .it('works without proxy settings', (ctx, done) => {
          expect(ctx.stdout).to.contain('Successfully generated the following models: ');
          done();
        });
    });
  
    describe('fetch with proxy and without proxy', () => {
      test
        .stderr()
        .stdout()
        .do(() => {
          const proxyUrl = 'http://127.0.0.1:3128';
          const proxyAgent = new HttpsProxyAgent(proxyUrl);
          const customFetch = (url, options = {}) => fetch(url, { ...options, agent: proxyAgent });
  
          customFetch('http://localhost:8080/dummySpec.yml')
            .then((response) => {
              expect(response.ok).to.be.true;
            })
            .catch((err) => {
              throw new Error(`Failed to fetch with proxy: ${err.message}`);
            });
        })
        .it('tests fetch with proxy agent');
  
      test
        .stderr()
        .stdout()
        .do(() => {
          fetch('http://localhost:8080/dummySpec.yml')
            .then((response) => {
              expect(response.ok).to.be.true;
            })
            .catch((err) => {
              throw new Error(`Failed to fetch without proxy: ${err.message}`);
            });
        })
        .it('tests fetch without proxy agent');
    });

  describe('with logging diagnostics', () => {
    test
      .stderr()
      .stdout()
      .command([...generalOptions, 'typescript', 'http://localhost:8080/dummySpec.yml', '--log-diagnostics'])
      .it('works with remote AsyncAPI files', (ctx, done) => {
        expect(ctx.stdout).to.match(/URL http:\/\/localhost:8080\/dummySpec.yml is valid but has \(itself and\/or referenced documents\) governance issues./);
        done();
      });
  });
});
