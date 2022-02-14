import { expect, test } from '@oclif/test';

describe('new', () => {
  test
    .stderr()
    .stdout()
    .command(['new', '--no-tty', '-n=specification.yaml'])
    .it('runs new command', (ctx, done) => {
      expect(ctx.stdout).to.contain('specification.yaml');
      done();
    });
});
