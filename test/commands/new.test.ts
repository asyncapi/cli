import { expect, test } from '@oclif/test';

describe('new', () => {
  test
    .stderr()
    .stdout()
    .command(['new', '--no-tty', '-n=specification.yaml'])
    .it('runs new command', ctx => {
      expect(ctx.stdout).to.contain('specification.yaml');
    });
});
