export function registryURLParser(input?: string) {
  if (!input) { return; }
  const isURL = /^https?:/;
  if (!isURL.test(input.toLowerCase())) {
    throw new Error('Invalid --registry-url flag. The param requires a valid http/https url.');
  }
}

export async function registryValidation(registryUrl?: string, registryAuth?: string, registryToken?: string) {
  if (!registryUrl) { return; }

  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    // Use HEAD request instead of GET for lightweight check
    const response = await fetch(registryUrl as string, {
      method: 'HEAD',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.status === 401 && !registryAuth && !registryToken) {
      throw new Error('You Need to pass either registryAuth in username:password encoded in Base64 or need to pass registryToken');
    }
  } catch (error) {
    clearTimeout(timeoutId);

    // Provide meaningful error messages based on error type
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Registry URL '${registryUrl}' is unreachable: connection timed out after 5 seconds. Please check the URL or your network connection.`);
      }
      // Re-throw authentication errors as-is
      if (error.message.includes('registryAuth')) {
        throw error;
      }
    }

    throw new Error(`Registry URL '${registryUrl}' is unreachable. Please verify the URL is correct and accessible.`);
  }
}
