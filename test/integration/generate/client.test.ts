import { test } from '@oclif/test';
import { rimrafSync } from 'rimraf';
import { expect } from '@oclif/test';

function cleanup(filepath: string) {
  rimrafSync(filepath);
}

describe('client', () => {
  after(() => {
    cleanup('./test/docs');
  });

  describe('should be able to generate client', () => {
    test
      .stderr()
      .stdout()
      .command([
        'generate:client',
        'javascript',
        './test/fixtures/specification-v3.yml',
        '-pserver=default',
        '--output=./test/docs/test-output',
        '--force-write',
        '--no-interactive',
      ])
      .it('should generate client successfully with v3 document', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new generated files at ./test/docs/test-output.\n\n'
        );
        cleanup('./test/docs/test-output');
        done();
      });
  }).timeout(200000);

  test
    .stdout()
    .command([
      'generate:client',
      'unsupported',
      './test/fixtures/specification-v3.yml',
      '--json',
    ])
    .it('maps unsupported languages in JSON mode', (ctx, done) => {
      const result = JSON.parse(ctx.stdout);
      expect(result.status).to.equal('error');
      expect(result.errors[0].code).to.equal('GENERATION_LANGUAGE_UNSUPPORTED');
      done();
    });
});
