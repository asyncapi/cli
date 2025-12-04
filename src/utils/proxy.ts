/**
 * Utility functions for handling proxy configuration
 */

export interface ProxyConfig {
  proxyHost?: string;
  proxyPort?: string;
}

/**
 * Applies proxy configuration to a file path or URL
 * @param filePath - Original file path or URL
 * @param proxyHost - Proxy hostname
 * @param proxyPort - Proxy port number
 * @returns File path with proxy URL appended if both host and port are provided
 */
export function applyProxyConfiguration(
  filePath: string | undefined,
  proxyHost?: string,
  proxyPort?: string,
): string {
  if (!filePath) {
    return '';
  }

  if (proxyHost && proxyPort) {
    const proxyUrl = `http://${proxyHost}:${proxyPort}`;
    return `${filePath}+${proxyUrl}`;
  }

  return filePath;
}

/**
 * Extracts proxy configuration from flags
 * @param flags - Command flags object
 * @returns Proxy configuration object
 */
export function extractProxyConfig(flags: Record<string, unknown>): ProxyConfig {
  return {
    proxyHost: flags.proxyHost as string | undefined,
    proxyPort: flags.proxyPort as string | undefined,
  };
}

