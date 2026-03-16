import { expect } from 'chai';
import { registryURLParser, registryValidation } from '../../../src/utils/generate/registry';

describe('registry', () => {
  describe('registryURLParser()', () => {
    it('should return undefined for empty input', () => {
      expect(registryURLParser(undefined)).to.be.undefined;
    });

    it('should accept valid http URL', () => {
      expect(() => registryURLParser('http://registry.npmjs.org')).to.not.throw();
    });

    it('should accept valid https URL', () => {
      expect(() => registryURLParser('https://registry.npmjs.org')).to.not.throw();
    });

    it('should throw for non-http URL', () => {
      expect(() => registryURLParser('ftp://example.com')).to.throw('Invalid --registry-url flag');
    });
  });

  describe('registryValidation()', () => {
    it('should return undefined for empty input', async () => {
      const result = await registryValidation(undefined);
      expect(result).to.be.undefined;
    });

    it('should throw a timeout error for unreachable host', async () => {
      // 10.255.255.1 is a non-routable IP that will cause a timeout
      try {
        await registryValidation('http://10.255.255.1');
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('timed out');
      }
    }).timeout(10000);

    it('should throw an error for invalid registry URL', async () => {
      try {
        await registryValidation('http://localhost:1');
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include("Can't fetch registryURL");
      }
    }).timeout(10000);
  });
});
