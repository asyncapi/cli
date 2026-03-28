const REGISTRY_TIMEOUT_MS = 10_000;

/** Custom error class for registry authentication errors */
class RegistryAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistryAuthError';
  }
}

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

  let response: Response;
  try {
    response = await fetch(registryUrl as string, {
      method: 'HEAD',
      signal: controller.signal,
    });
  } catch (error: unknown) {
    clearTimeout(timer);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Registry URL validation timed out after ${REGISTRY_TIMEOUT_MS / 1000}s: ${registryUrl}`);
    }
    throw new Error(`Unable to reach registry URL: ${registryUrl}`);
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401 && !registryAuth && !registryToken) {
    throw new RegistryAuthError('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
  }
}
