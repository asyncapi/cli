import { Args } from '@oclif/core';
import Command from '../../../core/base';
import { blueBright } from 'picocolors';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.asyncapi');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface SimpleAuthEntry {
  pattern: string;
  token: string;
}

export default class AuthAdd extends Command {
  static description = 'Add a Bearer auth config for resolving $ref files requiring HTTP Authorization.';

  static args = {
    pattern: Args.string({
      required: true,
      description: 'Glob pattern for matching protected URLs (e.g. github.com/org/repo/**/*.*)',
    }),
    token: Args.string({
      required: true,
      description: 'Bearer token',
    }),
  };

  async run() {
    const { args } = await this.parse(AuthAdd);
    const isEnvVar = args.token.startsWith('$');

    const entry: SimpleAuthEntry = {
      pattern: args.pattern,
      token: isEnvVar ? args.token.slice(1) : args.token,
    };

    try {
      await this.addAuthEntry(entry);
      this.log(
        `✅ Auth config added for ${blueBright(args.pattern)} using ${
          isEnvVar ? 'env var' : 'raw token'
        }: ${blueBright(args.token)}`
      );
    } catch (err) {
      this.error(`❌ Failed to add auth config: ${(err as Error).message}`);
    }
  }

  private async addAuthEntry(entry: SimpleAuthEntry): Promise<void> {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    let config: { auth?: SimpleAuthEntry[] } = {};
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const content = fs.readFileSync(CONFIG_FILE, 'utf8');
        config = JSON.parse(content);
      } catch (err) {
        throw new Error(`Failed to read config: ${(err as Error).message}`);
      }
    }

    if (!Array.isArray(config.auth)) {
      config.auth = [];
    }

    config.auth = config.auth.filter(e => e.pattern !== entry.pattern);
    config.auth.push(entry);

    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    } catch (err) {
      throw new Error(`Failed to write config: ${(err as Error).message}`);
    }
  }
}
