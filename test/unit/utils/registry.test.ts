import { expect } from 'chai';
import { registryURLParser, registryValidation } from '../../../src/utils/generate/registry';

describe('registryURLParser()', () => {
  it('should return undefined for no input', () => {
    expect(registryURLParser()).to.be.undefined;
    expect(registryURLParser('')).to.be.undefined;
  });

  it('should accept valid http URLs', () => {
    expect(registryURLParser('http://registry.example.com')).to.be.undefined;
    expect(registryURLParser('https://registry.example.com')).to.be.undefined;
  });

  it('should throw for invalid URLs', () => {
    expect(() => registryURLParser('ftp://example.com')).to.throw('Invalid --registry-url flag');
    expect(() => registryURLParser('not-a-url')).to.throw('Invalid --registry-url flag');
  });
});

describe('registryValidation()', () => {
  it('should return undefined for no input', async () => {
    const result = await registryValidation();
    expect(result).to.be.undefined;
  });

  it('should throw a timeout error for unreachable hosts', async () => {
    // 10.255.255.1 is a non-routable IP that will cause a timeout
    try {
      await registryValidation('http://10.255.255.1');
      expect.fail('Should have thrown');
    } catch (error: unknown) {
      expect(error).to.be.instanceOf(Error);
      expect((error as Error).message).to.match(/timed out|Can't fetch/);
    }
  }).timeout(10000);

  it('should throw for invalid/unreachable URLs', async () => {
    try {
      await registryValidation('http://localhost:1');
      expect.fail('Should have thrown');
    } catch (error: unknown) {
      expect(error).to.be.instanceOf(Error);
      expect((error as Error).message).to.include('Can\'t fetch registryURL');
    }
  }).timeout(10000);
});
