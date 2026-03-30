import { AbortController } from 'abort-controller';

const REGISTRY_TIMEOUT = 5000; // 5 seconds

export async function checkRegistryUrl(registryUrl: string): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REGISTRY_TIMEOUT);
  
  try {
    const response = await fetch(registryUrl, {
      method: 'HEAD',
      signal: controller.signal as AbortSignal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Registry returned status ${response.status}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Registry URL timeout after ${REGISTRY_TIMEOUT / 1000}s: ${registryUrl}. ` +
        `Please check if the registry is accessible or use a different URL.`
      );
    }
    
    throw new Error(
      `Failed to reach registry at ${registryUrl}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
