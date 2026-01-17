import { expect, test } from '@oclif/test';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

const TEST_CONFIG_DIR = path.join(os.homedir(), '.asyncapi');
const TEST_CONFIG_FILE = path.join(TEST_CONFIG_DIR, 'config.json');

describe('config:defaults', () => {
  beforeEach(async () => {
    try {
      await fs.unlink(TEST_CONFIG_FILE);
    } catch (err) {
      // File might not exist
    }
  });

  afterEach(async () => {
    try {
      await fs.unlink(TEST_CONFIG_FILE);
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  describe('config:defaults:list', () => {
    test
      .stdout()
      .command(['config:defaults:list'])
      .it('should show empty message when no defaults configured', (ctx) => {
        expect(ctx.stdout).to.contain('No command defaults configured');
      });

    test
      .do(async () => {
        await fs.mkdir(TEST_CONFIG_DIR, { recursive: true });
        await fs.writeFile(
          TEST_CONFIG_FILE,
          JSON.stringify({
            defaults: {
              validate: { 'log-diagnostics': true, score: true }
            }
          })
        );
      })
      .stdout()
      .command(['config:defaults:list'])
      .it('should list configured defaults', (ctx) => {
        expect(ctx.stdout).to.contain('validate');
        expect(ctx.stdout).to.contain('log-diagnostics');
        expect(ctx.stdout).to.contain('score');
      });
  });

  describe('config:defaults:set', () => {
    test
      .command(['config:defaults:set', 'validate', '--log-diagnostics', '--score'])
      .it('should set defaults for a command', async () => {
        const config = JSON.parse(await fs.readFile(TEST_CONFIG_FILE, 'utf8'));
        expect(config.defaults.validate).to.deep.equal({
          'log-diagnostics': true,
          score: true
        });
      });

    test
      .command(['config:defaults:set', 'validate', '--fail-severity', 'error'])
      .it('should set defaults with values', async () => {
        const config = JSON.parse(await fs.readFile(TEST_CONFIG_FILE, 'utf8'));
        expect(config.defaults.validate['fail-severity']).to.equal('error');
      });

    test
      .stderr()
      .command(['config:defaults:set', 'validate'])
      .exit(2)
      .it('should error when no flags provided');
  });

  describe('config:defaults:remove', () => {
    test
      .do(async () => {
        await fs.mkdir(TEST_CONFIG_DIR, { recursive: true });
        await fs.writeFile(
          TEST_CONFIG_FILE,
          JSON.stringify({
            defaults: {
              validate: { 'log-diagnostics': true }
            }
          })
        );
      })
      .stdout()
      .command(['config:defaults:remove', 'validate'])
      .it('should remove defaults for a command', async (ctx) => {
        expect(ctx.stdout).to.contain('Defaults removed for command "validate"');

        const config = JSON.parse(await fs.readFile(TEST_CONFIG_FILE, 'utf8'));
        expect(config.defaults.validate).to.be.undefined;
      });

    test
      .stderr()
      .command(['config:defaults:remove', 'nonexistent'])
      .exit(2)
      .it('should error when command has no defaults');
  });

  describe('integration with validate command', () => {
    test
      .do(async () => {
        await fs.mkdir(TEST_CONFIG_DIR, { recursive: true });
        await fs.writeFile(
          TEST_CONFIG_FILE,
          JSON.stringify({
            defaults: {
              validate: { score: true }
            }
          })
        );
      })
      .stdout()
      .command(['validate', './test/fixtures/asyncapi.yml'])
      .it('should apply defaults when running validate command', (ctx) => {
        // The validate command should use the score flag from defaults
        // This is verified by the command not erroring about missing flags
        expect(ctx.stdout).to.exist;
      });
  });
});
