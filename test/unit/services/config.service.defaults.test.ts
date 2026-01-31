import { expect } from 'chai';
import { ConfigService } from '@services/config.service';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

const TEST_CONFIG_DIR = path.join(os.homedir(), '.asyncapi');
const TEST_CONFIG_FILE = path.join(TEST_CONFIG_DIR, 'config.json');

describe('ConfigService - Command Defaults', () => {
  beforeEach(async () => {
    try {
      await fs.unlink(TEST_CONFIG_FILE);
    } catch (err) {
      // Config file might not exist
    }
  });

  afterEach(async () => {
    try {
      await fs.unlink(TEST_CONFIG_FILE);
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  describe('getCommandDefaults', () => {
    it('should return empty object if no defaults configured', async () => {
      const defaults = await ConfigService.getCommandDefaults('validate');
      expect(defaults).to.deep.equal({});
    });

    it('should return empty object if command has no defaults', async () => {
      await ConfigService.setCommandDefaults('validate', { 'log-diagnostics': true });
      const defaults = await ConfigService.getCommandDefaults('bundle');
      expect(defaults).to.deep.equal({});
    });

    it('should return configured defaults for a command', async () => {
      const expected = {
        'log-diagnostics': true,
        'fail-severity': 'error'
      };
      
      await ConfigService.setCommandDefaults('validate', expected);
      const defaults = await ConfigService.getCommandDefaults('validate');
      
      expect(defaults).to.deep.equal(expected);
    });

    it('should handle multiple commands with different defaults', async () => {
      await ConfigService.setCommandDefaults('validate', { 'log-diagnostics': true });
      await ConfigService.setCommandDefaults('bundle', { output: './dist/bundle.yaml' });
      
      const validateDefaults = await ConfigService.getCommandDefaults('validate');
      const bundleDefaults = await ConfigService.getCommandDefaults('bundle');
      
      expect(validateDefaults).to.deep.equal({ 'log-diagnostics': true });
      expect(bundleDefaults).to.deep.equal({ output: './dist/bundle.yaml' });
    });
  });

  describe('mergeWithDefaults', () => {
    it('should return CLI flags if no defaults configured', async () => {
      const cliFlags = { 'fail-severity': 'warning' };
      const merged = await ConfigService.mergeWithDefaults('validate', cliFlags);
      
      expect(merged).to.deep.equal(cliFlags);
    });

    it('should merge defaults with CLI flags', async () => {
      await ConfigService.setCommandDefaults('validate', {
        'log-diagnostics': true,
        'fail-severity': 'error'
      });

      const merged = await ConfigService.mergeWithDefaults('validate', {});
      
      expect(merged).to.deep.equal({
        'log-diagnostics': true,
        'fail-severity': 'error'
      });
    });

    it('should give CLI flags precedence over defaults', async () => {
      await ConfigService.setCommandDefaults('validate', {
        'fail-severity': 'error',
        'log-diagnostics': true
      });

      const merged = await ConfigService.mergeWithDefaults('validate', {
        'fail-severity': 'warning'
      });

      expect(merged).to.deep.equal({
        'fail-severity': 'warning',
        'log-diagnostics': true
      });
    });

    it('should handle boolean flags correctly', async () => {
      await ConfigService.setCommandDefaults('validate', {
        'log-diagnostics': true,
        score: false
      });

      const merged = await ConfigService.mergeWithDefaults('validate', {
        score: true
      });

      expect(merged).to.deep.equal({
        'log-diagnostics': true,
        score: true
      });
    });
  });

  describe('setCommandDefaults', () => {
    it('should create config file if it does not exist', async () => {
      await ConfigService.setCommandDefaults('validate', { 'log-diagnostics': true });
      
      const config = await ConfigService.loadConfig();
      expect(config.defaults).to.exist;
      expect(config.defaults?.validate).to.deep.equal({ 'log-diagnostics': true });
    });

    it('should update existing defaults for a command', async () => {
      await ConfigService.setCommandDefaults('validate', { 'log-diagnostics': true });
      await ConfigService.setCommandDefaults('validate', { score: true });
      
      const defaults = await ConfigService.getCommandDefaults('validate');
      expect(defaults).to.deep.equal({ score: true });
    });

    it('should preserve other command defaults when setting new ones', async () => {
      await ConfigService.setCommandDefaults('validate', { 'log-diagnostics': true });
      await ConfigService.setCommandDefaults('bundle', { output: './dist' });
      
      const config = await ConfigService.loadConfig();
      expect(config.defaults?.validate).to.deep.equal({ 'log-diagnostics': true });
      expect(config.defaults?.bundle).to.deep.equal({ output: './dist' });
    });
  });

  describe('removeCommandDefaults', () => {
    it('should remove defaults for a command', async () => {
      await ConfigService.setCommandDefaults('validate', { 'log-diagnostics': true });
      await ConfigService.removeCommandDefaults('validate');
      
      const defaults = await ConfigService.getCommandDefaults('validate');
      expect(defaults).to.deep.equal({});
    });

    it('should not error if command has no defaults', async () => {
      await ConfigService.removeCommandDefaults('nonexistent');
      // Should not throw
    });

    it('should preserve other command defaults when removing one', async () => {
      await ConfigService.setCommandDefaults('validate', { 'log-diagnostics': true });
      await ConfigService.setCommandDefaults('bundle', { output: './dist' });
      
      await ConfigService.removeCommandDefaults('validate');
      
      const config = await ConfigService.loadConfig();
      expect(config.defaults?.validate).to.be.undefined;
      expect(config.defaults?.bundle).to.deep.equal({ output: './dist' });
    });
  });

  describe('listAllDefaults', () => {
    it('should return empty object if no defaults configured', async () => {
      const allDefaults = await ConfigService.listAllDefaults();
      expect(allDefaults).to.deep.equal({});
    });

    it('should return all configured defaults', async () => {
      await ConfigService.setCommandDefaults('validate', { 'log-diagnostics': true });
      await ConfigService.setCommandDefaults('bundle', { output: './dist' });
      
      const allDefaults = await ConfigService.listAllDefaults();
      
      expect(allDefaults).to.deep.equal({
        validate: { 'log-diagnostics': true },
        bundle: { output: './dist' }
      });
    });
  });
});
