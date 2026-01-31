import { expect, test } from '@oclif/test';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

const TEST_CONFIG_DIR = path.join(os.homedir(), '.asyncapi');
const TEST_CONFIG_FILE = path.join(TEST_CONFIG_DIR, 'config.json');

describe('config:auth', () => {
  beforeEach(async () => {
    try {
      await fs.unlink(TEST_CONFIG_FILE);
    } catch (err) {
      // File might not exist
    }
    process.env.TEST_TOKEN = 'secret123';
  });

  afterEach(async () => {
    try {
      await fs.unlink(TEST_CONFIG_FILE);
    } catch (err) {
      // Cleanup
    }
    delete process.env.TEST_TOKEN;
  });

  describe('config:auth:list', () => {
    test
      .stdout()
      .command(['config:auth:list'])
      .it('should show empty message when no auth configured', (ctx) => {
        expect(ctx.stdout).to.contain('No authentication configured');
      });

    test
      .do(async () => {
        await fs.mkdir(TEST_CONFIG_DIR, { recursive: true });
        await fs.writeFile(
          TEST_CONFIG_FILE,
          JSON.stringify({
            auth: [
              {
                pattern: 'https://github.com/myorg/*',
                token: 'GITHUB_TOKEN',
                authType: 'token'
              }
            ]
          })
        );
      })
      .stdout()
      .command(['config:auth:list'])
      .it('should list configured auth entries', (ctx) => {
        expect(ctx.stdout).to.contain('github.com/myorg');
        expect(ctx.stdout).to.contain('token');
      });
  });

  describe('config:auth:add', () => {
    test
      .stdout()
      .command(['config:auth:add', 'https://github.com/myorg/*', '$TEST_TOKEN'])
      .it('should add auth entry with env var', async (ctx) => {
        expect(ctx.stdout).to.contain('Auth config added');

        const config = JSON.parse(await fs.readFile(TEST_CONFIG_FILE, 'utf8'));
        expect(config.auth).to.have.lengthOf(1);
        expect(config.auth[0].pattern).to.equal('https://github.com/myorg/*');
        expect(config.auth[0].token).to.equal('TEST_TOKEN');
      });

    test
      .stdout()
      .command(['config:auth:add', 'https://api.example.com/**', '$TEST_TOKEN', '--auth-type', 'Bearer'])
      .it('should add auth entry with custom auth type', async (ctx) => {
        const config = JSON.parse(await fs.readFile(TEST_CONFIG_FILE, 'utf8'));
        expect(config.auth[0].authType).to.equal('Bearer');
      });

    test
      .stdout()
      .command([
        'config:auth:add',
        'https://api.example.com/*',
        '$TEST_TOKEN',
        '--header',
        'X-API-Version=2.0',
        '--header',
        'X-Client-ID=test'
      ])
      .it('should add auth entry with custom headers', async (ctx) => {
        const config = JSON.parse(await fs.readFile(TEST_CONFIG_FILE, 'utf8'));
        expect(config.auth[0].headers).to.deep.equal({
          'X-API-Version': '2.0',
          'X-Client-ID': 'test'
        });
      });
  });

  describe('config:auth:remove', () => {
    test
      .do(async () => {
        await fs.mkdir(TEST_CONFIG_DIR, { recursive: true });
        await fs.writeFile(
          TEST_CONFIG_FILE,
          JSON.stringify({
            auth: [
              {
                pattern: 'https://github.com/myorg/*',
                token: 'GITHUB_TOKEN',
                authType: 'token'
              }
            ]
          })
        );
      })
      .stdout()
      .command(['config:auth:remove', 'https://github.com/myorg/*'])
      .it('should remove auth entry', async (ctx) => {
        expect(ctx.stdout).to.contain('Authentication removed');

        const config = JSON.parse(await fs.readFile(TEST_CONFIG_FILE, 'utf8'));
        expect(config.auth).to.have.lengthOf(0);
      });

    test
      .stderr()
      .command(['config:auth:remove', 'https://nonexistent.com/*'])
      .exit(2)
      .it('should error when no auth configured');
  });

  describe('config:auth:test', () => {
    test
      .do(async () => {
        await fs.mkdir(TEST_CONFIG_DIR, { recursive: true });
        await fs.writeFile(
          TEST_CONFIG_FILE,
          JSON.stringify({
            auth: [
              {
                pattern: 'https://github.com/myorg/*',
                token: '${TEST_TOKEN}',
                authType: 'token'
              }
            ]
          })
        );
      })
      .stdout()
      .command(['config:auth:test', 'https://github.com/myorg/repo/schema.yaml'])
      .it('should find matching auth', (ctx) => {
        expect(ctx.stdout).to.contain('Authentication found');
        expect(ctx.stdout).to.contain('token');
      });

    test
      .stdout()
      .command(['config:auth:test', 'https://no-match.com/schema.yaml'])
      .it('should show no match message', (ctx) => {
        expect(ctx.stdout).to.contain('No matching authentication found');
      });
  });
});
