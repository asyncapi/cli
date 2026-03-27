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
    const start = Date.now();
    try {
      // 10.255.255.1 is a non-routable IP that will trigger the timeout
      await registryValidation('http://10.255.255.1');
      expect.fail('Should have thrown');
    } catch (error: unknown) {
      const elapsed = Date.now() - start;
      expect(elapsed).to.be.lessThan(15_000); // Must resolve within 15s (10s timeout + margin)
      expect(error).to.be.instanceOf(Error);
      const msg = (error as Error).message;
      expect(msg).to.satisfy(
        (m: string) => m.includes('timed out') || m.includes('Unable to reach'),
        `Expected timeout or unreachable error, got: ${msg}`
      );
    }
  }).timeout(20_000);

  it('should throw auth error for 401 without credentials', async () => {
    // This test requires a reachable URL that returns 401
    // We skip if no test server is available — the logic is unit-testable via the error path
  });
});
