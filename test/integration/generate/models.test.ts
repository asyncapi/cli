import { expect, test } from '@oclif/test';
import path from 'path';
const generalOptions = ['generate:models'];
const outputDir = './test/fixtures/generate/models';

describe('models', () => {
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
