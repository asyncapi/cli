import { expect } from 'chai';
import { createHttpWithAuthResolver } from '../../../src/domains/services/validation.service';
import { ConfigService } from '../../../src/domains/services/config.service';

describe('createHttpWithAuthResolver()', () => {
  let originalFetch: typeof fetch;
  let capturedHeaders: Record<string, string> | undefined;
  let originalGetAuth: typeof ConfigService.getAuthForUrl;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalGetAuth = ConfigService.getAuthForUrl.bind(ConfigService);
    capturedHeaders = undefined;

    global.fetch = async (_input: Parameters<typeof fetch>[0], init?: RequestInit) => {
      capturedHeaders = { ...(init?.headers as Record<string, string>) };
      return {
        ok: true,
        statusText: 'OK',
        text: async () => 'resolved-content',
        json: async () => ({}),
      } as Awaited<ReturnType<typeof fetch>>;
    };

    ConfigService.getAuthForUrl = async () => null;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    ConfigService.getAuthForUrl = originalGetAuth;
  });

  it('should forward Cookie header when cookie is provided', async () => {
    const resolver = createHttpWithAuthResolver('session=abc; theme=dark');
    const result = await resolver.read({
      toString: () => 'https://example.com/schema.yaml',
    });

    expect(result).to.equal('resolved-content');
    expect(capturedHeaders?.Cookie).to.equal('session=abc; theme=dark');
    expect(capturedHeaders?.['User-Agent']).to.equal('AsyncAPI-CLI');
    expect(capturedHeaders?.Authorization).to.equal(undefined);
  });

  it('should not set Cookie header when cookie is omitted', async () => {
    const resolver = createHttpWithAuthResolver();
    await resolver.read({
      toString: () => 'https://example.com/schema.yaml',
    });

    expect(capturedHeaders?.Cookie).to.equal(undefined);
  });

  it('should treat empty or whitespace cookie as absent', async () => {
    const resolver = createHttpWithAuthResolver('   ');
    await resolver.read({
      toString: () => 'https://example.com/schema.yaml',
    });

    expect(capturedHeaders?.Cookie).to.equal(undefined);
  });

  it('should send both Authorization and Cookie when auth is configured', async () => {
    ConfigService.getAuthForUrl = async () => ({
      token: 'secret-token',
      authType: 'Bearer',
      headers: {},
    });

    const resolver = createHttpWithAuthResolver('session=xyz');
    await resolver.read({
      toString: () => 'https://example.com/private/schema.yaml',
    });

    expect(capturedHeaders?.Cookie).to.equal('session=xyz');
    expect(capturedHeaders?.Authorization).to.equal('Bearer secret-token');
  });
});
