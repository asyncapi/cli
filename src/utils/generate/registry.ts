export function registryURLParser(input?: string) {
  if (!input) { return; }
  const isURL = /^https?:/;
  if (!isURL.test(input.toLowerCase())) {
    throw new Error('Invalid --registry-url flag. The param requires a valid http/https url.');
  }
}

/**
 * Default timeout for registry URL validation in milliseconds.
 * This prevents the CLI from hanging indefinitely when the registry URL is unreachable.
 */
const REGISTRY_VALIDATION_TIMEOUT_MS = 5000;

export async function registryValidation(registryUrl?: string, registryAuth?: string, registryToken?: string) {
  if (!registryUrl) { return; }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REGISTRY_VALIDATION_TIMEOUT_MS);

  try {
    // Use HEAD request instead of GET for a lightweight connectivity check
    const response = await fetch(registryUrl as string, {
      method: 'HEAD',
      signal: controller.signal,
    });

    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (error) {
    // Handle timeout/abort specifically
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Registry URL validation timed out after ${REGISTRY_VALIDATION_TIMEOUT_MS / 1000} seconds. ` +
        `Could not reach: ${registryUrl}. ` +
        'Please check if the URL is correct and the server is accessible.'
      );
    }

    // Handle network errors with more descriptive messages
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      throw new Error(
        `Failed to connect to registry URL: ${registryUrl}. ` +
        'The server may be unreachable or the URL may be incorrect. ' +
        `Original error: ${error.message}`
      );
    }

    // Re-throw if it's already our custom error
    if (error instanceof Error && error.message.includes('You Need to pass')) {
      throw error;
    }

    // Generic fallback with original error info
    throw new Error(
      `Failed to validate registry URL: ${registryUrl}. ` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
