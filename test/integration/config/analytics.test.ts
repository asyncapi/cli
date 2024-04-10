import { expect, test } from '@oclif/test';
import TestHelper from '../../helpers';

const testHelper = new TestHelper();

describe('config:analytics', () => {
  afterEach(() => {
    testHelper.deleteAnalyticsConfigFile();
  });

  describe('with disable flag', () => {
    test
      .stderr()
      .stdout()
      .command(['config:analytics', '--disable'])
      .it('should show a successful message once the analytics are disabled', async (ctx, done) => {
        expect(ctx.stdout).to.equal('Analytics disabled.\n');
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
        expect(ctx.stdout).to.equal('Analytics enabled.\n');
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
        expect(ctx.stdout).to.equal('\nPlease append the "--disable" flag to the command in case you prefer to disable analytics, or use the "--enable" flag if you want to enable analytics back again.\n\n');
        expect(ctx.stderr).to.equal('');
        done();
      });
  });
});
