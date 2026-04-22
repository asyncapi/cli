export function registryURLParser(input?: string) {
  if (!input) { return; }
  const isURL = /^https?:/;
  if (!isURL.test(input.toLowerCase())) {
    throw new Error('Invalid --registry-url flag. The param requires a valid http/https url.');
  }
}

export async function registryValidation(registryUrl?: string, registryAuth?: string, registryToken?: string) {
  if (!registryUrl) { return; }
  const TIMEOUT_MS = 5000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(registryUrl as string, {
      method: 'HEAD',
      signal: controller.signal,
    });
    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Registry URL validation timed out after ${TIMEOUT_MS / 1000}s — the host at ${registryUrl} appears unreachable.`);
    }
    if (error instanceof Error && error.message.startsWith('You Need to pass')) {
      throw error;
    }
    throw new Error(`Unable to reach registry at ${registryUrl}. Ensure the URL is correct and the host is reachable.`);
  } finally {
    clearTimeout(timeoutId);
  }
}
