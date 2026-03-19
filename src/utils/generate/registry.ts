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
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(registryUrl as string, { signal: controller.signal });
    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Registry URL timed out after 10s: ${registryUrl}`);
    }
    throw new Error(`Can't fetch registryURL: ${registryUrl}`);
  } finally {
    clearTimeout(timeout);
  }
}
