import { test } from '@oclif/test';
import rimraf from 'rimraf';
import { expect } from '@oclif/test';

function cleanup(filepath: string) {
  rimraf.sync(filepath);
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
        '-p server=default',
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
});
