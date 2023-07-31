import { test } from '@oclif/test';

describe('versions', () => {
  describe('config:versions', () => {
    test
      .stderr()
      .stdout()
      .command(['config:versions'])
      .it('should show versions of AsyncAPI tools used', (ctx, done) => {
        expect(ctx.stdout).toContain('@asyncapi/cli/');
        expect(ctx.stdout).toContain('├@asyncapi/');
        expect(ctx.stdout).toContain('└@asyncapi/');
        expect(ctx.stderr).toEqual('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['config:versions'])
      .it('should show address of repository of AsyncAPI CLI', (ctx, done) => {
        expect(ctx.stdout).toContain('https://github.com/asyncapi/cli');
        expect(ctx.stderr).toEqual('');
        done();
      });
  });
});
