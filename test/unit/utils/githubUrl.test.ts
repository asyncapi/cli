import { expect } from 'chai';
import {
  buildGitHubContentsApiUrl,
  isValidGitHubBlobUrl,
  parseGitHubBlobUrl,
  resolveGitHubBlobUrl,
} from '../../../src/utils/github-url';

describe('github-url utilities', () => {
  describe('isValidGitHubBlobUrl()', () => {
    it('should accept valid GitHub blob URLs', () => {
      expect(
        isValidGitHubBlobUrl(
          'https://github.com/org/repo/blob/main/spec.yaml',
        ),
      ).to.equal(true);
      expect(
        isValidGitHubBlobUrl(
          'https://github.com/org/repo/blob/feature/new-validation/spec.yaml',
        ),
      ).to.equal(true);
    });

    it('should reject non-GitHub URLs', () => {
      expect(isValidGitHubBlobUrl('https://example.com/spec.yaml')).to.equal(
        false,
      );
    });
  });

  describe('parseGitHubBlobUrl()', () => {
    it('should parse a simple branch and file path', () => {
      const parsed = parseGitHubBlobUrl(
        'https://github.com/org/repo/blob/main/spec.yaml',
      );

      expect(parsed).to.deep.equal({
        owner: 'org',
        repo: 'repo',
        segments: ['main', 'spec.yaml'],
      });
    });

    it('should parse slash-based branches', () => {
      const parsed = parseGitHubBlobUrl(
        'https://github.com/org/repo/blob/feature/new-validation/spec.yaml',
      );

      expect(parsed).to.deep.equal({
        owner: 'org',
        repo: 'repo',
        segments: ['feature', 'new-validation', 'spec.yaml'],
      });
    });

    it('should ignore URL fragments', () => {
      const parsed = parseGitHubBlobUrl(
        'https://github.com/org/repo/blob/main/spec.yaml#/components/schemas/User',
      );

      expect(parsed?.segments).to.deep.equal(['main', 'spec.yaml']);
    });
  });

  describe('buildGitHubContentsApiUrl()', () => {
    it('should encode branch names with slashes', () => {
      expect(
        buildGitHubContentsApiUrl(
          'org',
          'repo',
          'feature/new-validation',
          'spec.yaml',
        ),
      ).to.equal(
        'https://api.github.com/repos/org/repo/contents/spec.yaml?ref=feature%2Fnew-validation',
      );
    });
  });

  describe('resolveGitHubBlobUrl()', () => {
    let originalFetch: typeof fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should pick the shortest valid branch/path split', async () => {
      global.fetch = async (input: Parameters<typeof fetch>[0]) => {
        const url = String(input);
        return {
          ok:
            url ===
            'https://api.github.com/repos/org/repo/contents/docs/api/spec.yaml?ref=main',
        } as Awaited<ReturnType<typeof fetch>>;
      };

      const resolved = await resolveGitHubBlobUrl(
        'https://github.com/org/repo/blob/main/docs/api/spec.yaml',
      );

      expect(resolved).to.equal(
        'https://api.github.com/repos/org/repo/contents/docs/api/spec.yaml?ref=main',
      );
    });

    it('should resolve slash-based branches when shorter splits fail', async () => {
      global.fetch = async (input: Parameters<typeof fetch>[0]) => {
        const url = String(input);
        return {
          ok: url.includes('ref=feature%2Fnew-validation'),
        } as Awaited<ReturnType<typeof fetch>>;
      };

      const resolved = await resolveGitHubBlobUrl(
        'https://github.com/org/repo/blob/feature/new-validation/spec.yaml',
      );

      expect(resolved).to.equal(
        'https://api.github.com/repos/org/repo/contents/spec.yaml?ref=feature%2Fnew-validation',
      );
    });

    it('should return the original URL when parsing fails', async () => {
      const url = 'https://example.com/spec.yaml';
      const resolved = await resolveGitHubBlobUrl(url);
      expect(resolved).to.equal(url);
    });
  });
});
