import { runCommand } from '@oclif/test';
import { expect } from 'chai';
import { fileCleanup } from '../../helpers';
import { describe, beforeEach, afterEach, it } from 'mocha';

const analyticsConfigFilePath = './test/fixtures/.asyncapi-analytics';

describe('config:analytics', () => {
  beforeEach(() => {
    process.env = Object.assign(process.env, {
      ASYNCAPI_METRICS_CONFIG_PATH: analyticsConfigFilePath,
    });
  });

  afterEach(() => {
    fileCleanup(analyticsConfigFilePath);
  });

  describe('with disable flag', () => {
    it('should show a successful message once the analytics are disabled', async () => {
      const { stdout, stderr } = await runCommand([
        'config:analytics',
        '--disable',
      ]);
      expect(stdout).to.equal('\nAnalytics disabled.\n\n');
      expect(stderr).to.equal('');
    });
  });

  describe('with enable flag', () => {
    it('should show a successful message once the analytics are enabled', async () => {
      const { stdout, stderr } = await runCommand([
        'config:analytics',
        '--enable',
      ]);
      expect(stdout).to.equal('\nAnalytics enabled.\n\n');
      expect(stderr).to.equal('');
    });
  });

  describe('with no flags', () => {
    it('should show informational message when no flags are used', async () => {
      const { stdout, stderr } = await runCommand(['config:analytics']);
      expect(stdout).to.equal(
        '\nPlease append the --disable flag to the command if you prefer to disable analytics, or use the --enable flag if you want to enable analytics again. To check the current analytics status, use the --status flag.\n\n',
      );
      expect(stderr).to.equal('');
    });
  });

  describe('with status flag', () => {
    it('should show a successful message once the analytics are enabled', async () => {
      const { stdout, stderr } = await runCommand([
        'config:analytics',
        '--status',
      ]);
      expect(stdout).to.contain('\nAnalytics are ');
      expect(stderr).to.equal('');
    });
  });
});
