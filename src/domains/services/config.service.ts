import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';

const CONFIG_DIR = path.join(os.homedir(), '.asyncapi');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface AuthEntry {
  pattern: string;
  token: string;
  authType?: string;
  headers?: Record<string, string>;
}

export interface AuthResult {
  token: string;
  authType: string;
  headers: Record<string, string>;
}

interface Config {
  auth?: AuthEntry[];
}

export class ConfigService {
  /**
   * Load config file (~/.asyncapi/config.json)
   */
  static async loadConfig(): Promise<Config> {
    try {
      const content = await fs.readFile(CONFIG_FILE, 'utf8');
      return JSON.parse(content) as Config;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return {}; // no config yet
      }
      throw new Error(`Error reading config file: ${err.message}`);
    }
  }

  /**
   * Save config back to file
   */
  static async saveConfig(config: Config): Promise<void> {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  }

  /**
   * Add a new auth entry
   */
  static async addAuthEntry(entry: AuthEntry): Promise<void> {
    const config = await this.loadConfig();
    config.auth ??= [];
    config.auth.push(entry);
    await this.saveConfig(config);
  }

  /**
   * Reads auth config from ~/.asyncapi/config.json and
   * returns auth info matching the given URL, or null if no match.
   * 
   * @param url - URL to match against auth patterns
   * @returns Auth info or null if no match found
   */
  static async getAuthForUrl(url: string): Promise<AuthResult | null> {
    const config = await this.loadConfig();

    if (!config.auth || !Array.isArray(config.auth)) {
      console.warn('⚠️ No valid "auth" array found in config');
      return null;
    }

    for (const entry of config.auth) {
      try {
        const regex = this.wildcardToRegex(entry.pattern);
        if (regex.test(url)) {
          return {
            token: entry.token,
            authType: entry.authType || 'Bearer',
            headers: entry.headers || {}
          };
        }
      } catch (err: any) {
        console.warn(`⚠️ Invalid pattern "${entry.pattern}": ${err.message}`);
      }
    }

    return null;
  }

  /**
   * Convert wildcard pattern (*, **) to RegExp matching start of string
   * @param pattern - wildcard pattern
   */
  private static wildcardToRegex(pattern: string): RegExp {
    const rawPattern = String.raw`${pattern}`;
    // Sonar-safe regex escaping using String.raw
    const escapePattern = '[.+?^${}()|[\\]\\\\]';
    const escaped = rawPattern.replaceAll(new RegExp(escapePattern, 'g'), '\\$&');
    // Convert wildcards:
    // ** -> match any depth
    // *  -> match one segment
    const regexStr = escaped
      .replaceAll('**', '.*') // ** -> .*
      .replaceAll('*', '[^/]*'); // * -> any chars except '/'

    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(`^${regexStr}$`);
  }
}
