export function registryURLParser(input?: string) {
  if (!input) { return; }
  const isURL = /^https?:/;
  if (!isURL.test(input.toLowerCase())) {
    throw new Error('Invalid --registry-url flag. The param requires a valid http/https url.');
  }
}

const REGISTRY_FETCH_TIMEOUT_MS = 5000;

export async function registryValidation(registryUrl?: string, registryAuth?: string, registryToken?: string) {
  if (!registryUrl) { return; }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REGISTRY_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(registryUrl as string, { method: 'HEAD', signal: controller.signal });
    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Registry URL timed out after ${REGISTRY_FETCH_TIMEOUT_MS / 1000}s: ${registryUrl}`);
    }
    if (err instanceof Error && err.message.startsWith('You Need to pass')) {
      throw err;
    }
    throw new Error(`Can't fetch registryURL: ${registryUrl}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
