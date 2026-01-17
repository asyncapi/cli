import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';

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

export interface CommandDefaults {
  [commandId: string]: Record<string, any>;
}

interface Config {
  auth?: AuthEntry[];
  defaults?: CommandDefaults;
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
    if (!config.auth) {
      config.auth = [];
    }
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
      return null;
    }

    for (const entry of config.auth) {
      try {
        const regex = this.wildcardToRegex(entry.pattern);
        if (regex.test(url)) {
          return {
            token: this.resolveToken(entry.token),
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

  private static resolveToken(tokenTemplate: string): string {
    const envVarPattern = /\$\{([^}]+)\}/;
    const match = envVarPattern.exec(tokenTemplate);
    
    if (match) {
      const envVar = match[1];
      const value = process.env[envVar];
      
      if (!value) {
        console.warn(`⚠️  Environment variable "${envVar}" is not set`);
        return '';
      }
      
      return value;
    }
    
    return tokenTemplate;
  }

  /**
   * Convert wildcard pattern (*, **) to RegExp matching start of string
   * @param pattern - wildcard pattern
   */
  private static wildcardToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');

    const regexStr = escaped
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*');
     
    return new RegExp(`^${regexStr}`);
  }

  // ========================================
  // COMMAND DEFAULTS METHODS (Phase 1)
  // ========================================

  /**
   * Get default flags for a specific command
   * @param commandId - Command identifier (e.g., 'validate', 'generate:fromTemplate')
   * @returns Default flags object or empty object if none configured
   */
  static async getCommandDefaults(
    commandId: string
  ): Promise<Record<string, any>> {
    const config = await this.loadConfig();
    return config.defaults?.[commandId] || {};
  }

  /**
   * Merge CLI flags with config defaults
   * CLI flags take precedence over config defaults
   * @param commandId - Command identifier
   * @param cliFlags - Flags passed via CLI
   * @returns Merged flags object
   */
  static async mergeWithDefaults(
    commandId: string,
    cliFlags: Record<string, any>
  ): Promise<Record<string, any>> {
    const defaults = await this.getCommandDefaults(commandId);
    
    // CLI flags override defaults (spread order matters!)
    return { ...defaults, ...cliFlags };
  }

  /**
   * Set default flags for a command
   * @param commandId - Command identifier
   * @param defaults - Default flags to set
   */
  static async setCommandDefaults(
    commandId: string,
    defaults: Record<string, any>
  ): Promise<void> {
    const config = await this.loadConfig();
    
    config.defaults ??= {};
    
    config.defaults[commandId] = defaults;
    await this.saveConfig(config);
  }

  /**
   * Remove defaults for a command
   * @param commandId - Command identifier
   */
  static async removeCommandDefaults(commandId: string): Promise<void> {
    const config = await this.loadConfig();
    
    if (config.defaults?.[commandId]) {
      delete config.defaults[commandId];
      await this.saveConfig(config);
    }
  }

  /**
   * List all configured command defaults
   * @returns Map of command IDs to their defaults
   */
  static async listAllDefaults(): Promise<CommandDefaults> {
    const config = await this.loadConfig();
    return config.defaults || {};
  }
}
