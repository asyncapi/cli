import * as fs from 'fs';
import * as path from 'path';
import { test } from '@oclif/test';
import rimraf from 'rimraf';
import { expect } from '@oclif/test';

const nonInteractive = '--no-interactive';
const asyncapiv3 = './test/fixtures/specification-v3.yml';

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
        'java',
        asyncapiv3,
        '--output=./test/docs/client-test',
        '--force-write',
        nonInteractive,
      ])
      .it('should generate client successfully with v3 document', (ctx, done) => {
        expect(ctx.stdout).to.contain(
          'Check out your shiny new generated files at ./test/docs/client-test.\n\n'
        );
        cleanup('./test/docs/client-test');
        done();
      });
  }).timeout(200000);
});
