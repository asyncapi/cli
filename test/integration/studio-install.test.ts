import { expect, test } from '@oclif/test';

describe('studio:install', () => {
  test
    .stdout()
    .command(['studio:install', '--yes'])
    .it('reports where Studio is available', (ctx) => {
      expect(ctx.stdout).to.contain('Studio is ready at');
    });
});
