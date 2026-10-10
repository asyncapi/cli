/**
 * Default wait before registry reachability check fails (https://github.com/asyncapi/cli/issues/2027).
 * 15s balances fail-fast vs slow VPNs/proxies; override with ASYNCAPI_REGISTRY_CHECK_TIMEOUT_MS.
 */
const REGISTRY_REACHABILITY_TIMEOUT_MS = 15_000;

function registryReachabilityTimeoutMs(): number {
  const env = process.env.ASYNCAPI_REGISTRY_CHECK_TIMEOUT_MS;
  if (env !== undefined && env !== '') {
    const parsed = Number(env);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return REGISTRY_REACHABILITY_TIMEOUT_MS;
}

export function registryURLParser(input?: string) {
  if (!input) { return; }
  const isURL = /^https?:/;
  if (!isURL.test(input.toLowerCase())) {
    throw new Error('Invalid --registry-url flag. The param requires a valid http/https url.');
  }
}

function isAbortError(err: unknown): boolean {
  if (err instanceof Error && err.name === 'AbortError') {
    return true;
  }
  return (
    typeof DOMException !== 'undefined' &&
    err instanceof DOMException &&
    err.name === 'AbortError'
  );
}

async function fetchWithTimeout(
  url: string,
  init: Omit<RequestInit, 'signal'>,
): Promise<Response> {
  const controller = new AbortController();
  const ms = registryReachabilityTimeoutMs();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function registryValidation(registryUrl?: string, registryAuth?: string, registryToken?: string) {
  if (!registryUrl) { return; }
  try {
    let response = await fetchWithTimeout(registryUrl as string, {
      method: 'HEAD',
      redirect: 'follow',
    });
    if (response.status === 405) {
      response = await fetchWithTimeout(registryUrl as string, {
        method: 'GET',
        redirect: 'follow',
      });
    }
    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('You Need to pass')) {
      throw err;
    }
    if (isAbortError(err)) {
      const seconds = registryReachabilityTimeoutMs() / 1000;
      throw new Error(
        `Registry URL timed out or is unreachable after ${seconds}s: ${registryUrl}`,
      );
    }
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Can't fetch registryURL: ${registryUrl} (${detail})`);
  }
}
