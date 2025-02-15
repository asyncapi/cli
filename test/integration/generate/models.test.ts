import { expect, test } from '@oclif/test';
import path from 'path';
import rimraf from 'rimraf';
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
    
  test
    .stderr()
    .stdout()
    .command([...generalOptions,'typescript','http://localhost:8080/dummySpec.yml --proxyHost=host --proxyPort=8080'])
    .it('should throw error when url is passed with proxyHost and proxyPort with invalid host ', (ctx, done) => {
      expect(ctx.stdout).to.contain('');
      expect(ctx.stderr).to.equal('error loading AsyncAPI document from url: Failed to download http://localhost:8080/dummySpec.yml --proxyHost=host --proxyPort=8080.\n');
      done();
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
