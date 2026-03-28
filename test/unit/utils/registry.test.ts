import { expect } from 'chai';
import { registryURLParser, registryValidation } from '../../../src/utils/generate/registry';

describe('registryURLParser()', () => {
  it('should return undefined for empty input', () => {
    expect(registryURLParser(undefined)).to.be.undefined;
    expect(registryURLParser('')).to.be.undefined;
  });

  it('should accept valid http URLs', () => {
    expect(() => registryURLParser('https://registry.npmjs.org')).to.not.throw();
    expect(() => registryURLParser('http://localhost:4873')).to.not.throw();
  });

  it('should reject non-http URLs', () => {
    expect(() => registryURLParser('ftp://registry.example.com')).to.throw('Invalid --registry-url');
    expect(() => registryURLParser('not-a-url')).to.throw('Invalid --registry-url');
  });
});

describe('registryValidation()', () => {
  it('should return undefined when no URL provided', async () => {
    const result = await registryValidation(undefined);
    expect(result).to.be.undefined;
  });

  it('should fail fast for unreachable URLs instead of hanging', async () => {
    // Stub fetch to simulate a timeout scenario without real network calls
    const originalFetch = global.fetch;
    global.fetch = () => new Promise((_, reject) => {
      // Simulate abort after timeout
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      setTimeout(() => reject(abortError), 50);
    });

    try {
      await registryValidation('http://example.com');
      expect.fail('Should have thrown');
    } catch (error: unknown) {
      expect(error).to.be.instanceOf(Error);
      const msg = (error as Error).message;
      expect(msg).to.include('timed out');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should throw auth error for 401 without credentials', async () => {
    const originalFetch = global.fetch;
    global.fetch = () => Promise.resolve(new Response(null, { status: 401 }));

    try {
      await registryValidation('http://example.com');
      expect.fail('Should have thrown');
    } catch (error: unknown) {
      expect(error).to.be.instanceOf(Error);
      const msg = (error as Error).message;
      expect(msg).to.include('registryAuth');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should throw unreachable error for network failures', async () => {
    const originalFetch = global.fetch;
    global.fetch = () => Promise.reject(new Error('Network error'));

    try {
      await registryValidation('http://example.com');
      expect.fail('Should have thrown');
    } catch (error: unknown) {
      expect(error).to.be.instanceOf(Error);
      const msg = (error as Error).message;
      expect(msg).to.include('Unable to reach');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
