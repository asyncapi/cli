/**
 * Tests for registry validation fix (asyncapi/cli#2027)
 *
 * Place this file at: test/unit/utils/registry.test.ts
 */
import { registryURLParser, registryValidation } from '@utils/generate/registry';

// Mock global fetch
const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

describe('registryURLParser', () => {
  it('should return undefined for empty input', () => {
    expect(registryURLParser()).toBeUndefined();
    expect(registryURLParser(undefined)).toBeUndefined();
  });

  it('should accept valid http URLs', () => {
    expect(() => registryURLParser('http://registry.example.com')).not.toThrow();
    expect(() => registryURLParser('https://registry.npmjs.org')).not.toThrow();
    expect(() => registryURLParser('HTTP://REGISTRY.EXAMPLE.COM')).not.toThrow();
  });

  it('should reject non-http URLs', () => {
    expect(() => registryURLParser('ftp://registry.example.com')).toThrow('Invalid --registry-url flag');
    expect(() => registryURLParser('not-a-url')).toThrow('Invalid --registry-url flag');
  });
});

describe('registryValidation', () => {
  it('should return undefined for empty registry URL', async () => {
    const result = await registryValidation();
    expect(result).toBeUndefined();
  });

  it('should succeed for a reachable registry', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    await expect(registryValidation('https://registry.npmjs.org')).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      'https://registry.npmjs.org',
      expect.objectContaining({
        method: 'HEAD',
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('should use HEAD method instead of GET', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
    });

    await registryValidation('https://registry.npmjs.org');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://registry.npmjs.org',
      expect.objectContaining({ method: 'HEAD' }),
    );
  });

  it('should throw auth error when registry returns 401 without credentials', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 401,
      ok: false,
    });

    await expect(registryValidation('https://private-registry.com')).rejects.toThrow(
      'You Need to pass either registryAuth',
    );
  });

  it('should not throw auth error when registry returns 401 with registryAuth', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 401,
      ok: false,
    });

    await expect(
      registryValidation('https://private-registry.com', 'dXNlcjpwYXNz'),
    ).resolves.toBeUndefined();
  });

  it('should not throw auth error when registry returns 401 with registryToken', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 401,
      ok: false,
    });

    await expect(
      registryValidation('https://private-registry.com', undefined, 'my-token'),
    ).resolves.toBeUndefined();
  });

  it('should throw timeout error for unreachable host', async () => {
    // Simulate AbortError (what happens when AbortController.abort() is called)
    global.fetch = jest.fn().mockImplementation(() => {
      const error = new DOMException('The operation was aborted', 'AbortError');
      return Promise.reject(error);
    });

    await expect(
      registryValidation('http://10.255.255.1'),
    ).rejects.toThrow(/unreachable.*timed out/);
  });

  it('should throw network error for DNS failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('fetch failed'));

    await expect(
      registryValidation('https://nonexistent.invalid'),
    ).rejects.toThrow(/Can't reach registry/);
  });

  it('should include the registry URL in timeout error message', async () => {
    const unreachableUrl = 'http://10.255.255.1';
    global.fetch = jest.fn().mockImplementation(() => {
      const error = new DOMException('The operation was aborted', 'AbortError');
      return Promise.reject(error);
    });

    await expect(registryValidation(unreachableUrl)).rejects.toThrow(unreachableUrl);
  });

  it('should include the registry URL in general error message', async () => {
    const badUrl = 'https://broken-registry.invalid';
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

    await expect(registryValidation(badUrl)).rejects.toThrow(badUrl);
  });
});
