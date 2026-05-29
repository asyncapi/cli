const REGISTRY_TIMEOUT_MS = 5000; // 5 seconds timeout for registry validation

export async function registryValidation(registryUrl: string): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REGISTRY_TIMEOUT_MS);

  try {
    await fetch(registryUrl, {
      method: 'HEAD', // Use HEAD for a lightweight reachability check
      signal: controller.signal,
    });
  } catch (error: any) { // Use 'any' for error type to handle both AbortError and other network errors
    if (error.name === 'AbortError') {
      throw new Error(
        `Connection to registry URL '${registryUrl}' timed out after ${REGISTRY_TIMEOUT_MS / 1000} seconds. ` +
        `Please ensure the URL is correct and the host is reachable.`
      );
    }
    // Handle other network-related errors (e.g., DNS resolution failure, connection refused)
    throw new Error(
      `Failed to connect to registry URL '${registryUrl}'. ` +
      `Network error: ${error.message}. ` +
      `Please check your network connection and the provided registry URL.`
    );
  } finally {
    clearTimeout(timeoutId);
  }
}