import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';

// Use compiled lib to avoid ESM resolution issues with IMapBaseUrlToFlag import chain
const { getMapBaseUrlToFolderResolver } = require('../../../../lib/utils/generate/mapBaseUrl');

describe('getMapBaseUrlToFolderResolver()', () => {
  const tmpDir = path.join(os.tmpdir(), 'mapbaseurl-test');
  const testFile = path.join(tmpDir, 'user.yaml');
  const testContent = 'type: object\nproperties:\n  name:\n    type: string\n';

  before(() => {
    // Create temp directory and file for testing
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(testFile, testContent, 'utf8');
  });

  after(() => {
    // Clean up
    try { fs.unlinkSync(testFile); } catch { /* ignore */ }
    try { fs.rmdirSync(tmpDir); } catch { /* ignore */ }
  });

  it('should return a resolver with order 1', () => {
    const resolver = getMapBaseUrlToFolderResolver({
      url: 'http://example.com/schemas',
      folder: '/local/schemas',
    });
    expect(resolver.order).to.equal(1);
  });

  it('should always return true for canRead', () => {
    const resolver = getMapBaseUrlToFolderResolver({
      url: 'http://example.com',
      folder: '/local',
    });
    expect(resolver.canRead()).to.be.true;
  });

  it('should resolve with file data when read succeeds', async () => {
    const resolver = getMapBaseUrlToFolderResolver({
      url: 'http://example.com/schemas',
      folder: tmpDir,
    });

    const result = await resolver.read({ url: 'http://example.com/schemas/user.yaml' });
    expect(result.toString()).to.equal(testContent);
  });

  it('should reject when file does not exist', async () => {
    const resolver = getMapBaseUrlToFolderResolver({
      url: 'http://example.com/schemas',
      folder: tmpDir,
    });

    try {
      await resolver.read({ url: 'http://example.com/schemas/nonexistent.yaml' });
      expect.fail('should have rejected');
    } catch (err) {
      expect(err).to.include('Error opening file');
      expect(err).to.include('nonexistent.yaml');
    }
  });

  it('should replace base URL with folder path correctly', async () => {
    // Create a nested directory with a test file
    const nestedDir = path.join(tmpDir, 'models');
    const nestedFile = path.join(nestedDir, 'order.json');
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(nestedFile, '{"type":"object"}', 'utf8');

    const resolver = getMapBaseUrlToFolderResolver({
      url: 'http://example.com/schemas',
      folder: tmpDir,
    });

    const result = await resolver.read({ url: 'http://example.com/schemas/models/order.json' });
    expect(result.toString()).to.equal('{"type":"object"}');

    // Cleanup nested
    fs.unlinkSync(nestedFile);
    fs.rmdirSync(nestedDir);
  });
});
