import { expect } from 'chai';
import {
  registryURLParser,
  registryValidation,
} from '../../../src/utils/generate/registry';

describe('registryURLParser()', () => {
  it('allows undefined', () => {
    expect(registryURLParser(undefined)).to.equal(undefined);
  });

  it('rejects non-http(s) url', () => {
    expect(() => registryURLParser('ftp://x')).to.throw(/Invalid --registry-url/);
  });
});

describe('registryValidation()', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('no-ops when registry url is missing', async () => {
    await registryValidation(undefined);
  });

  it('succeeds on HEAD 200', async () => {
    globalThis.fetch = async () =>
      new Response(null, { status: 200 }) as unknown as Response;
    await registryValidation('https://registry.npmjs.org');
  });

  it('retries with GET when HEAD returns 405', async () => {
    let calls = 0;
    globalThis.fetch = async (_url, init) => {
      calls += 1;
      const method = (init as RequestInit)?.method ?? 'GET';
      if (calls === 1) {
        expect(method).to.equal('HEAD');
        return new Response(null, { status: 405 }) as unknown as Response;
      }
      expect(method).to.equal('GET');
      return new Response(null, { status: 200 }) as unknown as Response;
    };
    await registryValidation('https://example.com/npm');
    expect(calls).to.equal(2);
  });

  it('throws when 401 and no credentials', async () => {
    globalThis.fetch = async () =>
      new Response(null, { status: 401 }) as unknown as Response;
    try {
      await registryValidation('https://private.registry/npm');
      expect.fail('expected throw');
    } catch (e: unknown) {
      expect((e as Error).message).to.match(/registryAuth|registryToken/);
    }
  });

  it('does not throw on 401 when token is set', async () => {
    globalThis.fetch = async () =>
      new Response(null, { status: 401 }) as unknown as Response;
    await registryValidation('https://private.registry/npm', undefined, 'tok');
  });

  it('surfaces timeout as a clear error', async () => {
    process.env.ASYNCAPI_REGISTRY_CHECK_TIMEOUT_MS = '50';
    try {
      globalThis.fetch = async (_url, init) => {
        const signal = (init as RequestInit).signal;
        return await new Promise<Response>((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
          });
        });
      };
      try {
        await registryValidation('http://10.255.255.1');
        expect.fail('expected throw');
      } catch (e: unknown) {
        expect((e as Error).message).to.match(/timed out|unreachable/);
        expect((e as Error).message).to.include('10.255.255.1');
      }
    } finally {
      delete process.env.ASYNCAPI_REGISTRY_CHECK_TIMEOUT_MS;
    }
  });

  it('includes underlying message on network failure', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('fetch failed');
    };
    try {
      await registryValidation('https://registry.npmjs.org');
      expect.fail('expected throw');
    } catch (e: unknown) {
      expect((e as Error).message).to.include('Can\'t fetch registryURL');
      expect((e as Error).message).to.include('fetch failed');
    }
  });
});
