/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { registryValidation, registryURLParser } from '../../../src/utils/generate/registry';

describe('registryURLParser()', () => {
  it('should return undefined for empty input', () => {
    expect(registryURLParser()).to.be.undefined;
  });

  it('should throw for non-URL input', () => {
    expect(() => registryURLParser('not-a-url')).to.throw('Invalid --registry-url flag');
  });

  it('should accept http URLs', () => {
    expect(() => registryURLParser('http://localhost:8080')).to.not.throw();
  });

  it('should accept https URLs', () => {
    expect(() => registryURLParser('https://example.com')).to.not.throw();
  });
});

describe('registryValidation()', () => {
  it('should return undefined when no registryUrl is provided', async function() {
    const result = await registryValidation();
    expect(result).to.be.undefined;
  });

  it('should throw timeout error for unreachable URL', async function() {
    // Use a non-routable IP that will cause a timeout
    try {
      await registryValidation('http://10.255.255.1');
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect((err as Error).message).to.include('timed out');
    }
  });
});
