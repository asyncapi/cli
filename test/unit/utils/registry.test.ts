import { registryURLParser, registryValidation } from '../../../src/utils/generate/registry';

describe('registryURLParser', () => {
  it('should return undefined for undefined input', () => {
    expect(registryURLParser(undefined)).toBeUndefined();
  });

  it('should not throw for valid http URL', () => {
    expect(() => registryURLParser('http://registry.npmjs.org')).not.toThrow();
  });

  it('should not throw for valid https URL', () => {
    expect(() => registryURLParser('https://registry.npmjs.org')).not.toThrow();
  });

  it('should throw for non-http URL', () => {
    expect(() => registryURLParser('ftp://registry.npmjs.org')).toThrow('Invalid --registry-url flag');
  });

  it('should throw for plain string', () => {
    expect(() => registryURLParser('not-a-url')).toThrow('Invalid --registry-url flag');
  });
});

describe('registryValidation', () => {
  it('should return undefined when no registryUrl is provided', async () => {
    await expect(registryValidation(undefined)).resolves.toBeUndefined();
  });

  it('should time out for unreachable hosts', async () => {
    // 10.255.255.1 is a non-routable IP that will never respond
    await expect(registryValidation('http://10.255.255.1')).rejects.toThrow(/unreachable.*timed out/i);
  }, 10000);

  it('should throw a descriptive error for invalid hosts', async () => {
    await expect(registryValidation('http://this-host-does-not-exist-at-all.invalid')).rejects.toThrow(/Unable to reach registry URL/);
  });
});
