export function registryURLParser(input?: string) {
  if (!input) { return; }
  const isURL = /^https?:/;
  if (!isURL.test(input.toLowerCase())) {
    throw new Error('Invalid --registry-url flag. The param requires a valid http/https url.');
  }
}

export async function registryValidation(registryUrl?: string, registryAuth?: string, registryToken?: string) {
  if (!registryUrl) { return; }
  
  // Set timeout to prevent indefinite hanging
  const timeoutMs = 10000; // 10 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    // Use HEAD request for lightweight validation
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
    
    // Provide specific error messages
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Registry URL validation timed out after ${timeoutMs/1000}s: ${registryUrl}`);
    }
    if (error instanceof Error && error.message.includes('registryAuth')) {
      throw error; // Re-throw auth errors as-is
    }
    throw new Error(`Can't fetch registryURL: ${registryUrl}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
