export function registryURLParser(input?: string) {
  if (!input) { return; }
  const isURL = /^https?:/;
  if (!isURL.test(input.toLowerCase())) {
    throw new Error('Invalid --registry-url flag. The param requires a valid http/https url.');
  }
}

export async function registryValidation(registryUrl?: string, registryAuth?: string, registryToken?: string) {
  if (!registryUrl) { return; }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(registryUrl as string, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Registry URL timed out after 5s: ${registryUrl}`);
    }
    if (error instanceof Error && error.message.startsWith('You Need to pass')) {
      throw error;
    }
    throw new Error(`Can't fetch registryURL: ${registryUrl}`);
  }
}
