import { expect, test } from '@oclif/test';
import { fileCleanup } from '../../helpers/index';

const analyticsConfigFilePath = './test/fixtures/.asyncapi-analytics';

describe('config:analytics', () => {
  beforeEach(() => {
    process.env = Object.assign(process.env, { ASYNCAPI_METRICS_CONFIG_PATH: analyticsConfigFilePath });
  });

  afterEach(() => {
    fileCleanup(analyticsConfigFilePath);
  });

  describe('with disable flag', () => {
    test
      .stderr()
      .stdout()
      .command(['config:analytics', '--disable'])
      .it('should show a successful message once the analytics are disabled', async (ctx, done) => {
        expect(ctx.stdout).to.equal('\nAnalytics disabled.\n\n');
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with enable flag', () => {
    test
      .stderr()
      .stdout()
      .command(['config:analytics', '--enable'])
      .it('should show a successful message once the analytics are enabled', (ctx, done) => {
        expect(ctx.stdout).to.equal('\nAnalytics enabled.\n\n');
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with no flags', () => {
    test
      .stderr()
      .stdout()
      .command(['config:analytics'])
      .it('should show informational message when no flags are used', (ctx, done) => {
        expect(ctx.stdout).to.equal('\nPlease append the --disable flag to the command if you prefer to disable analytics, or use the --enable flag if you want to enable analytics again. To check the current analytics status, use the --status flag.\n\n');
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with status flag', () => {
    test
      .stderr()
      .stdout()
      .command(['config:analytics', '--status'])
      .it('should show a different informational message depending on the analytics status', (ctx, done) => {
        expect(ctx.stdout).to.contain('\nAnalytics are ');
        expect(ctx.stderr).to.equal('');
        done();
      });
  });
});
