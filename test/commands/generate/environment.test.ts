import { test } from '@oclif/test';
import rimraf from 'rimraf';

const generalOptions = [
  'generate:fromTemplate',
  './test/specification.yml',
  '@asyncapi/minimaltemplate',
];

describe('git', () => {
  test
    .stderr()
    .command([...generalOptions, '--output=./test/doc'])
    .it(
      'should throw error if output folder is in a git repository',
      (ctx, done) => {
        expect(ctx.stderr).toContain(
          'Error: "./test/doc" is in a git repository with unstaged changes.'
        );
        rimraf.sync('./test/doc');
        done();
      }
    );
});
