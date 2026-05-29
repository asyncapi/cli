import { BaseService } from './base.service';
import { Specification } from '@models/SpecificationFile';
import { ConfigService } from './config.service';

export interface PublishOptions {
  endpoint?: string; // full URL to POST the document to
  path?: string; // path appended to endpoint
  contentType?: string;
}

export class RegistryService extends BaseService {
  /**
   * Publish an AsyncAPI specification to a registry endpoint.
   * This performs a simple POST with the document text. Authentication
   * is taken from `ConfigService` when available for the given URL.
   */
  async publish(
    spec: Specification,
    registryUrl: string,
    options: PublishOptions = {},
  ): Promise<{ success: boolean; location?: string; error?: string }> {
    try {
      const url = options.endpoint || registryUrl;
      const headers: Record<string, string> = {
        'Content-Type': options.contentType || 'application/yaml',
        'User-Agent': 'AsyncAPI-CLI',
      };

      const auth = await ConfigService.getAuthForUrl(url);
      if (auth) {
        headers['Authorization'] = `${auth.authType} ${auth.token}`;
        Object.assign(headers, auth.headers || {});
      }

      const res = await fetch(url + (options.path ?? ''), {
        method: 'POST',
        headers,
        body: spec.text(),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        return { success: false, error: `Publish failed: ${res.status} ${res.statusText} ${body}` };
      }

      const location = res.headers.get('location') || undefined;
      return { success: true, location };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Pull a document from a remote registry URL.
   */
  async pull(url: string): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      const headers: Record<string, string> = { 'User-Agent': 'AsyncAPI-CLI' };
      const auth = await ConfigService.getAuthForUrl(url);
      if (auth) {
        headers['Authorization'] = `${auth.authType} ${auth.token}`;
        Object.assign(headers, auth.headers || {});
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        return { success: false, error: `Failed to fetch: ${res.status} ${res.statusText}` };
      }
      const text = await res.text();
      return { success: true, content: text };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }
}
