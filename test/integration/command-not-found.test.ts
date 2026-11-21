import { expect, test } from '@oclif/test';

describe('command_not_found hook', () => {
  test
    .stdout()
    .stderr()
    .command(['valdate', '--json'])
    .it('emits a COMMAND_NOT_FOUND envelope without prompting in JSON mode', (ctx) => {
      const result = JSON.parse(ctx.stdout);
      expect(Object.keys(result)).to.have.members(['status', 'message', 'data', 'errors']);
      expect(result.status).to.equal('error');
      expect(result.data.command).to.equal('valdate');
      expect(result.data.suggestion).to.equal('validate');
      expect(result.errors[0].code).to.equal('COMMAND_NOT_FOUND');
      expect(process.exitCode).to.equal(127);
      process.exitCode = undefined;
    });
});
