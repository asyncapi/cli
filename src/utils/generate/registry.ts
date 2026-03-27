const REGISTRY_TIMEOUT_MS = 10_000;

export function registryURLParser(input?: string) {
  if (!input) { return; }
  const isURL = /^https?:/;
  if (!isURL.test(input.toLowerCase())) {
    throw new Error('Invalid --registry-url flag. The param requires a valid http/https url.');
  }
}

export async function registryValidation(registryUrl?: string, registryAuth?: string, registryToken?: string) {
  if (!registryUrl) { return; }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REGISTRY_TIMEOUT_MS);

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
      throw new Error(`Registry URL validation timed out after ${REGISTRY_TIMEOUT_MS / 1000}s: ${registryUrl}`);
    }
    if (error instanceof Error && error.message.includes('registryAuth')) {
      throw error;
    }
    throw new Error(`Unable to reach registry URL: ${registryUrl}`);
  } finally {
    clearTimeout(timer);
  }
}
