export interface GitHubBlobUrlParts {
  owner: string;
  repo: string;
  segments: string[];
}

/**
 * Validates if a URL is a GitHub blob URL.
 */
export function isValidGitHubBlobUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === 'github.com' &&
      parsedUrl.pathname.split('/')[3] === 'blob'
    );
  } catch {
    return false;
  }
}

/**
 * Parses a GitHub blob URL into owner, repo, and path segments after /blob/.
 */
export function parseGitHubBlobUrl(url: string): GitHubBlobUrlParts | null {
  const urlWithoutFragment = url.split('#')[0];
  const githubWebPattern =
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/;
  const match = urlWithoutFragment.match(githubWebPattern);

  if (!match) {
    return null;
  }

  const [, owner, repo, branchAndPath] = match;
  const segments = branchAndPath.split('/');

  if (segments.length < 2) {
    return null;
  }

  return { owner, repo, segments };
}

/**
 * Builds a GitHub Contents API URL from parsed blob URL parts.
 */
export function buildGitHubContentsApiUrl(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
): string {
  return `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`;
}

/**
 * Resolves a GitHub blob URL to a Contents API URL.
 * Tries progressively longer branch names to support slash-based branches.
 */
export async function resolveGitHubBlobUrl(
  url: string,
  headers: Record<string, string> = {},
): Promise<string> {
  const parsed = parseGitHubBlobUrl(url);
  if (!parsed) {
    return url;
  }

  const { owner, repo, segments } = parsed;
  const requestHeaders = {
    ...headers,
    Accept: 'application/vnd.github.v3+json',
  };

  for (let i = 1; i < segments.length; i++) {
    const branch = segments.slice(0, i).join('/');
    const filePath = segments.slice(i).join('/');
    const apiUrl = buildGitHubContentsApiUrl(owner, repo, branch, filePath);

    try {
      const res = await fetch(apiUrl, {
        method: 'HEAD',
        headers: requestHeaders,
      });
      if (res.ok) {
        return apiUrl;
      }
    } catch {
      // Try the next branch/path split.
    }
  }

  const branch = segments[0];
  const filePath = segments.slice(1).join('/');
  return buildGitHubContentsApiUrl(owner, repo, branch, filePath);
}
