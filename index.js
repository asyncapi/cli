import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';

// Construct the config file path: ~/.asyncapi/config.json
const CONFIG_DIR = path.join(os.homedir(), '.asyncapi');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// URL to check
const url = 'https://github.com/AayushSaini101/AayushSaini101/blob/main/user-signedup.yaml#/payload'; // Change to test

try {
  // Read config file
  const content = await fs.readFile(CONFIG_FILE, 'utf8');

  let config;
  try {
    config = JSON.parse(content);
    console.log(config);
  } catch (parseError) {
    throw new Error(`Invalid JSON in config file: ${parseError.message}`);
  }

  // Match URL to auth config
  const result = matchAuth(url, config);

  if (result) {
    console.log('✅ Auth match found:', result);
  } else {
    console.log('❌ No auth match found for URL:', url);
  }
} catch (err) {
  console.error('❌ Error reading or processing config file:', err.message);
}

// Match auth config based on wildcard pattern
function matchAuth(url, config) {
  if (!config.auth || !Array.isArray(config.auth)) {
    console.warn('⚠️  No valid "auth" array found in config');
    return null;
  }

  for (const entry of config.auth) {
    try {
      const regex = wildcardToRegex(entry.pattern);
      if (regex.test(url)) {
        return {
          token: entry.token,
          authType: entry.authType || 'Bearer',
          headers: entry.headers || {}
        };
      }
    } catch (err) {
      console.warn(`⚠️  Invalid pattern "${entry.pattern}": ${err.message}`);
    }
  }

  return null;
}

function wildcardToRegex(pattern) {
  // Escape regex special characters
  const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');

  // Convert wildcards:
  // ** → .*
  // *  → [^/]*  (match everything except slash)
  const regexStr = escaped
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*');

  // Match URLs that START with the pattern
  return new RegExp(`^${regexStr}`);
}
