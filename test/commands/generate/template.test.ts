import {expect, test} from '@oclif/test';
// eslint-disable-next-line
// @ts-ignore
import rimraf from 'rimraf';

describe('template', () => {
  test
    .stdout()
    .command(['generate:template', 
      './test/specification.yml', 
      '@asyncapi/html-template', 
      '--output=./test/docs',
      '--force-write'
    ])
    .it('should generate html tempalte', (ctx, done) => {
      expect(ctx.stdout).to.contain('Check out your shiny new generated files at ./test/docs.\n\n');
      rimraf.sync('./test/docs');
      done();
    });
});
