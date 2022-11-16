import { test } from '@oclif/test';
import fs from 'fs';

function cleanup(filepath: string) {
  fs.unlinkSync(filepath);
}

describe('bundle', () => {
  test
    .stdout()
    .command([
      'bundle','./test/commands/bundle/asyncapi.yaml',
      '--output=./test/commands/bundle/final.yaml',
    ])
    .it('should successfully bundle specification', (ctx, done) => {
      expect(ctx.stdout).toContain(
        'Check out your shiny new bundled files at ./test/commands/bundle/final.yaml'
      );
      cleanup('./test/commands/bundle/final.yaml');
      done();
    });
});
