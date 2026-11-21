import { expect, test } from '@oclif/test';

describe('config', () => {
  describe('config:versions', () => {
    test
      .stderr()
      .stdout()
      .command(['config:versions'])
      .it('should show versions of AsyncAPI tools used', (ctx, done) => {
        expect(ctx.stdout).to.contain('@asyncapi/cli/');
        expect(ctx.stdout).to.contain('├@asyncapi/');
        expect(ctx.stdout).to.contain('└@asyncapi/');
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['config:versions'])
      .it('should show address of repository of AsyncAPI CLI', (ctx, done) => {
        expect(ctx.stdout).to.contain('https://github.com/asyncapi/cli');
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stdout()
      .command(['config:versions', '--json'])
      .it('returns structured version data', (ctx) => {
        const output = JSON.parse(ctx.stdout);
        expect(output.status).to.equal('success');
        expect(output.data.cli.name).to.equal('@asyncapi/cli');
        expect(output.data.packages).to.be.an('array');
      });
  });
});
