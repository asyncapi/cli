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
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(registryUrl as string, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Registry URL unreachable (timeout after 5s): ${registryUrl}`);
    }
    throw new Error(`Can't fetch registryURL: ${registryUrl} — ${error instanceof Error ? error.message : String(error)}`);
  }
}
