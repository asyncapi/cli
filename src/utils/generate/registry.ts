/** Default timeout for registry URL validation in milliseconds */
const REGISTRY_VALIDATION_TIMEOUT_MS = 5000;

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
  const timeoutId = setTimeout(() => controller.abort(), REGISTRY_VALIDATION_TIMEOUT_MS);
  
  try {
    // Use HEAD request for a lightweight check instead of GET
    const response = await fetch(registryUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Registry URL validation timed out after ${REGISTRY_VALIDATION_TIMEOUT_MS / 1000}s: ${registryUrl}. ` +
        'The server may be unreachable or responding slowly. Please check the URL and try again.'
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to reach registry URL: ${registryUrl}. ` +
      `Error: ${errorMessage}. ` +
      'Please verify the URL is correct and the server is accessible.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
