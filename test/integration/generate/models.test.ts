/* eslint-disable no-warning-comments */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/no-identical-functions */
import { expect, test } from '@oclif/test';
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
