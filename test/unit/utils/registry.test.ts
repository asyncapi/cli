import { expect } from 'chai';
import { registryURLParser, registryValidation } from '../../../src/utils/generate/registry';

describe('registryURLParser()', () => {
  it('should return undefined for empty input', () => {
    expect(registryURLParser(undefined)).to.equal(undefined);
    expect(registryURLParser('')).to.equal(undefined);
  });

  it('should throw for invalid URL without protocol', () => {
    expect(() => registryURLParser('not-a-url')).to.throw('Invalid --registry-url flag. The param requires a valid http/https url.');
    expect(() => registryURLParser('ftp://example.com')).to.throw('Invalid --registry-url flag. The param requires a valid http/https url.');
  });

  it('should accept valid http URL', () => {
    expect(() => registryURLParser('http://example.com')).to.not.throw();
  });

  it('should accept valid https URL', () => {
    expect(() => registryURLParser('https://example.com')).to.not.throw();
  });
});

describe('registryValidation()', () => {
  it('should return undefined when no registryUrl is provided', async () => {
    const result = await registryValidation(undefined, undefined, undefined);
    expect(result).to.equal(undefined);
  });

  it('should throw when URL is unreachable (timeout)', async () => {
    // 10.255.255.1 is a blackhole IP - will never respond
    const blackholeUrl = 'http://10.255.255.1:9999';
    try {
      await registryValidation(blackholeUrl, undefined, undefined);
      expect.fail('Should have thrown');
    } catch (err: any) {
      expect(err.message).to.include('timed out');
      expect(err.message).to.include(blackholeUrl);
    }
  });

  it('should throw when URL is unreachable (connection refused)', async () => {
    // localhost:9 is unlikely to have anything listening
    const url = 'http://localhost:9';
    try {
      await registryValidation(url, undefined, undefined);
      expect.fail('Should have thrown');
    } catch (err: any) {
      expect(err.message).to.include('Can\'t fetch registryURL');
    }
  });
});
