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
    const response = await fetch(registryUrl as string);
    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (err) {
    const causeMsg = err instanceof Error ? err.message : String(err);
    const errToThrow = new Error(`Can't fetch registryURL: ${registryUrl}\nCaused by: ${causeMsg}`);
    try {
      // prefer using the standardized `cause` when available
      (errToThrow as any).cause = err;
    } catch (_) {
      // ignore if we can't attach cause
    }
    throw errToThrow;
  }
}
