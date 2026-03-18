/**
 * Fix for asyncapi/cli#2027:
 * CLI hangs indefinitely when --registry-url points to an unreachable host.
 *
 * Changes:
 * 1. Added AbortController with 5-second timeout
 * 2. Changed GET to HEAD for lightweight validation
 * 3. Added specific error message for timeout vs general fetch failure
 * 4. Proper cleanup of timer in finally block
 */

const REGISTRY_TIMEOUT_MS = 5000;

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
  const timeoutId = setTimeout(() => controller.abort(), REGISTRY_TIMEOUT_MS);

  try {
    const response = await fetch(registryUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });

    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        `Registry URL '${registryUrl}' is unreachable (timed out after ${REGISTRY_TIMEOUT_MS / 1000}s). Please verify the URL is correct and the registry is accessible.`
      );
    }
    // Re-throw auth errors as-is
    if (err instanceof Error && err.message.includes('registryAuth')) {
      throw err;
    }
    throw new Error(`Can't reach registry at '${registryUrl}'. Please check the URL and your network connection.`);
  } finally {
    clearTimeout(timeoutId);
  }
}
