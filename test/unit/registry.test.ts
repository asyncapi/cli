import { expect } from 'chai';
import { registryValidation } from '../../src/utils/generate/registry';

describe('registryValidation', () => {
  const originalFetch = (globalThis as any).fetch;

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
  });

  it('returns undefined when no url provided', async () => {
    const result = await registryValidation(undefined);
    expect(result).to.equal(undefined);
  }).timeout(5000);

  it('wraps fetch errors and preserves cause', async () => {
    const networkError = new Error('getaddrinfo ENOTFOUND my-registry.example.com');
    (globalThis as any).fetch = () => { throw networkError; };

    try {
      await registryValidation('https://my-registry.example.com');
      throw new Error('Expected registryValidation to throw');
    } catch (err: any) {
      expect(String(err.message)).to.contain("Can't fetch registryURL: https://my-registry.example.com");
      expect(String(err.message)).to.contain('Caused by: getaddrinfo ENOTFOUND my-registry.example.com');
      expect((err as any).cause).to.equal(networkError);
    }
  }).timeout(5000);

  it('wraps 401 auth response and preserves cause message', async () => {
    (globalThis as any).fetch = async () => ({ status: 401 });

    try {
      await registryValidation('https://my-registry.example.com');
      throw new Error('Expected registryValidation to throw');
    } catch (err: any) {
      expect(String(err.message)).to.contain("Can't fetch registryURL: https://my-registry.example.com");
      expect(String(err.message)).to.contain('Caused by: You Need to pass either registryAuth');
      expect((err as any).cause).to.be.instanceOf(Error);
      expect((err as any).cause.message).to.contain('You Need to pass either registryAuth');
    }
  }).timeout(5000);
});
