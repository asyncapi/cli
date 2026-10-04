import { expect, test } from '@oclif/test';

describe('studio:install', () => {
  test
    .stdout()
    .command(['studio:install', '--yes'])
    .it('reports where Studio is available', (ctx) => {
      expect(ctx.stdout).to.contain('Studio is ready at');
    });

  test
    .stdout()
    .command(['studio:install', '--json'])
    .it('returns the Studio path without prompting', (ctx) => {
      const output = JSON.parse(ctx.stdout);
      expect(output.status).to.equal('success');
      expect(output.data.path).to.be.a('string');
    });
});
