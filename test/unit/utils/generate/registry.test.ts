import { checkRegistryUrl } from '../../../src/utils/generate/registry';

describe('checkRegistryUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed for reachable registry', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });

    await expect(checkRegistryUrl('https://registry.npmjs.org')).resolves.not.toThrow();
  });

  it('should throw error for unreachable registry (timeout)', async () => {
    global.fetch = jest.fn().mockImplementation(() => 
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 10000);
      })
    );

    await expect(checkRegistryUrl('http://10.255.255.1')).rejects.toThrow('timeout');
  });

  it('should throw error for non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(checkRegistryUrl('https://example.com')).rejects.toThrow('404');
  });
});
