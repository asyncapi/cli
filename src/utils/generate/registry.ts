export function registryURLParser(input?: string) {
  if (!input) { return; }
  const isURL = /^https?:/;
  if (!isURL.test(input.toLowerCase())) {
    throw new Error('Invalid --registry-url flag. The param requires a valid http/https url.');
  }
}

export async function registryValidation(registryUrl?: string, registryAuth?: string, registryToken?: string) {
  if (!registryUrl) { return; }
  const authErrorMessage = 'You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken';
  try {
    const response = await fetch(registryUrl as string, { signal: AbortSignal.timeout(5000) });
    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error(authErrorMessage);
    }
  } catch (error) {
    if (error instanceof Error && error.message === authErrorMessage) {
      throw error;
    }

    throw new Error(`Registry URL is unreachable or timed out: ${registryUrl}`);
  }
}
