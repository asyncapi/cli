import { registryURLParser, registryValidation } from '../../../src/utils/generate/registry';

describe('registryURLParser', () => {
  it('should return undefined for empty input', () => {
    expect(registryURLParser()).toBeUndefined();
    expect(registryURLParser('')).toBeUndefined();
  });

  it('should accept valid http URLs', () => {
    expect(() => registryURLParser('http://example.com')).not.toThrow();
    expect(() => registryURLParser('https://registry.example.com/api')).not.toThrow();
  });

  it('should reject non-http URLs', () => {
    expect(() => registryURLParser('ftp://example.com')).toThrow('Invalid --registry-url flag');
    expect(() => registryURLParser('file:///path/to/file')).toThrow('Invalid --registry-url flag');
    expect(() => registryURLParser('not-a-url')).toThrow('Invalid --registry-url flag');
  });
});

describe('registryValidation', () => {
  it('should return undefined for empty URL', async () => {
    await expect(registryValidation()).resolves.toBeUndefined();
    await expect(registryValidation('')).resolves.toBeUndefined();
  });

  it('should timeout after 5 seconds on unreachable URL', async () => {
    // Use a TEST-NET IP that is guaranteed to be unreachable (RFC 5737)
    // This should trigger the AbortController timeout
    const result = registryValidation('http://192.0.2.1:9999/registry');
    await expect(result).rejects.toThrow('timed out');
  }, 10000); // Allow 10s for the test (5s timeout + buffer)

  it('should throw with URL context on connection error', async () => {
    // localhost:1 should immediately refuse connection
    await expect(registryValidation('http://localhost:1/nonexistent'))
      .rejects.toThrow('Can\'t fetch registryURL');
  });

  it('should throw when 401 without auth credentials', async () => {
    // Mock fetch to return 401
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      status: 401,
    });

    try {
      await expect(registryValidation('http://example.com/registry'))
        .rejects.toThrow('registryAuth');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should not throw when 401 with registryAuth provided', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      status: 401,
    });

    try {
      await expect(registryValidation('http://example.com/registry', 'dXNlcjpwYXNz'))
        .resolves.toBeUndefined();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should not throw when 401 with registryToken provided', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      status: 401,
    });

    try {
      await expect(registryValidation('http://example.com/registry', undefined, 'token123'))
        .resolves.toBeUndefined();
    } finally {
      global.fetch = originalFetch;
    }
  });
});
