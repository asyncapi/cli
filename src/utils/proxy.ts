/**
 * Utility functions for proxy configuration.
 * Centralizes proxy URL handling to avoid code duplication across commands.
 */

/**
 * Applies proxy configuration to a file path or URL.
 * If both proxyHost and proxyPort are provided, appends the proxy URL to the path.
 * 
 * @param filePath - The original file path or URL
 * @param proxyHost - The proxy host name (optional)
 * @param proxyPort - The proxy port number (optional)
 * @returns The file path with proxy configuration appended, or the original path
 * 
 * @example
 * applyProxyToPath('./asyncapi.yaml', 'localhost', '8080')
 * // Returns: './asyncapi.yaml+http://localhost:8080'
 * 
 * applyProxyToPath('./asyncapi.yaml')
 * // Returns: './asyncapi.yaml'
 */
export function applyProxyToPath(
  filePath: string | undefined,
  proxyHost?: string,
  proxyPort?: string | number
): string | undefined {
  if (!filePath) {
    return filePath;
  }
  
  if (proxyHost && proxyPort) {
    const proxyUrl = `http://${proxyHost}:${proxyPort}`;
    return `${filePath}+${proxyUrl}`;
  }
  
  return filePath;
}

/**
 * Builds a proxy URL from host and port.
 * 
 * @param proxyHost - The proxy host name
 * @param proxyPort - The proxy port number
 * @returns The proxy URL or undefined if either parameter is missing
 */
export function buildProxyUrl(
  proxyHost?: string,
  proxyPort?: string | number
): string | undefined {
  if (proxyHost && proxyPort) {
    return `http://${proxyHost}:${proxyPort}`;
  }
  return undefined;
}

