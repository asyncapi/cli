import fetch, { AbortController } from 'node-fetch'; // Assuming `node-fetch` is used. If `fetch` is globally available (Node.js 18+), AbortController is also global, and this line can be adjusted to `const AbortController = globalThis.AbortController;` or simply rely on global scope.

const REGISTRY_TIMEOUT_MS = 5000; // 5 seconds timeout for registry validation

export async function registryValidation(registryUrl: string): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REGISTRY_TIMEOUT_MS);

  try {
    const response = await fetch(registryUrl, {
      method: 'HEAD', // Use HEAD for a lightweight check, as we only care about reachability
      signal: controller.signal,
    });

    if (!response.ok) {
      // If the response is not OK (e.g., 404, 500), it implies the URL is reachable but not a valid registry endpoint or has server-side issues.
      throw new Error(
        `Registry URL '${registryUrl}' returned an unsuccessful status ${response.status} (${response.statusText}). ` +
        `It might not be a valid registry endpoint or is experiencing server issues.`,
      );
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Handle timeout specifically
      throw new Error(
        `Failed to connect to registry URL '${registryUrl}' within ${REGISTRY_TIMEOUT_MS / 1000} seconds. ` +
        `This typically indicates a network issue, an incorrect URL, or that the registry host is unreachable/slow.`,
      );
    } else {
      // Handle other network-related errors (DNS lookup failed, connection refused, etc.)
      throw new Error(
        `Failed to connect to registry URL '${registryUrl}'. ` +
        `Please ensure the host is reachable and the URL is correct. ` +
        `Original network error: ${error.message}`,
      );
    }
  } finally {
    clearTimeout(timeoutId); // Ensure the timeout is cleared to prevent resource leaks
  }
}