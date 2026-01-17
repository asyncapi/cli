import { expect } from 'chai';
import { ConfigService } from '@services/config.service';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

const TEST_CONFIG_DIR = path.join(os.homedir(), '.asyncapi');
const TEST_CONFIG_FILE = path.join(TEST_CONFIG_DIR, 'config.json');

describe('ConfigService - Auth Token Resolution', () => {
  beforeEach(async () => {
    // Clear existing config file before each test
    try {
      await fs.unlink(TEST_CONFIG_FILE);
    } catch (err) {
      // File might not exist
    }
    process.env.TEST_TOKEN = 'secret123';
    process.env.GITHUB_PAT = 'ghp_test456';
  });

  afterEach(async () => {
    // Clean up config file after each test
    try {
      await fs.unlink(TEST_CONFIG_FILE);
    } catch (err) {
      // Ignore cleanup errors
    }
    delete process.env.TEST_TOKEN;
    delete process.env.GITHUB_PAT;
  });

  describe('resolveToken', () => {
    it('should resolve environment variable in token template', async () => {
      await ConfigService.addAuthEntry({
        pattern: 'https://example.com/*',
        token: '${TEST_TOKEN}',
        authType: 'Bearer'
      });

      const authResult = await ConfigService.getAuthForUrl('https://example.com/schema.yaml');
      expect(authResult?.token).to.equal('secret123');
    });

    it('should return empty string if environment variable not set', async () => {
      await ConfigService.addAuthEntry({
        pattern: 'https://example.com/*',
        token: '${MISSING_VAR}',
        authType: 'Bearer'
      });

      const authResult = await ConfigService.getAuthForUrl('https://example.com/schema.yaml');
      expect(authResult?.token).to.equal('');
    });

    it('should return token as-is if not a template', async () => {
      await ConfigService.addAuthEntry({
        pattern: 'https://example.com/*',
        token: 'hardcoded-token-123',
        authType: 'Bearer'
      });

      const authResult = await ConfigService.getAuthForUrl('https://example.com/schema.yaml');
      expect(authResult?.token).to.equal('hardcoded-token-123');
    });

    it('should handle multiple environment variables in different entries', async () => {
      await ConfigService.addAuthEntry({
        pattern: 'https://github.com/*',
        token: '${GITHUB_PAT}',
        authType: 'token'
      });

      await ConfigService.addAuthEntry({
        pattern: 'https://api.example.com/*',
        token: '${TEST_TOKEN}',
        authType: 'Bearer'
      });

      const githubAuth = await ConfigService.getAuthForUrl('https://github.com/org/repo');
      const apiAuth = await ConfigService.getAuthForUrl('https://api.example.com/data');

      expect(githubAuth?.token).to.equal('ghp_test456');
      expect(apiAuth?.token).to.equal('secret123');
    });
  });

  describe('getAuthForUrl with wildcards', () => {
    it('should match single wildcard (*)', async () => {
      await ConfigService.addAuthEntry({
        pattern: 'https://github.com/myorg/*',
        token: '${GITHUB_PAT}',
        authType: 'token'
      });

      const auth = await ConfigService.getAuthForUrl('https://github.com/myorg/repo');
      expect(auth).to.not.be.null;
      expect(auth?.token).to.equal('ghp_test456');
    });

    it('should match double wildcard (**)', async () => {
      await ConfigService.addAuthEntry({
        pattern: 'https://api.example.com/**',
        token: '${TEST_TOKEN}',
        authType: 'Bearer'
      });

      const auth = await ConfigService.getAuthForUrl('https://api.example.com/v1/deep/path/schema.yaml');
      expect(auth).to.not.be.null;
      expect(auth?.token).to.equal('secret123');
    });

    it('should not match if pattern does not match URL', async () => {
      await ConfigService.addAuthEntry({
        pattern: 'https://github.com/myorg/*',
        token: '${GITHUB_PAT}',
        authType: 'token'
      });

      const auth = await ConfigService.getAuthForUrl('https://github.com/otherorg/repo');
      expect(auth).to.be.null;
    });

    it('should return first matching pattern', async () => {
      await ConfigService.addAuthEntry({
        pattern: 'https://api.example.com/**',
        token: '${TEST_TOKEN}',
        authType: 'Bearer'
      });

      await ConfigService.addAuthEntry({
        pattern: 'https://api.example.com/v1/*',
        token: '${GITHUB_PAT}',
        authType: 'token'
      });

      const auth = await ConfigService.getAuthForUrl('https://api.example.com/v1/schema.yaml');
      expect(auth?.token).to.equal('secret123');
    });
  });

  describe('auth with custom headers', () => {
    it('should return custom headers', async () => {
      await ConfigService.addAuthEntry({
        pattern: 'https://api.example.com/*',
        token: '${TEST_TOKEN}',
        authType: 'Bearer',
        headers: {
          'X-API-Version': '2.0',
          'X-Client-ID': 'asyncapi-cli'
        }
      });

      const auth = await ConfigService.getAuthForUrl('https://api.example.com/schema.yaml');
      expect(auth?.headers).to.deep.equal({
        'X-API-Version': '2.0',
        'X-Client-ID': 'asyncapi-cli'
      });
    });
  });
});
