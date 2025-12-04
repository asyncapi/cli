import { Args, Flags } from '@oclif/core';
import Command from '@cli/internal/base';
import { blueBright } from 'picocolors';
import { ConfigService, AuthEntry } from '@/domains/services/config.service';

export default class AuthAdd extends Command {
  static readonly description =
    'Add an authentication config for resolving $ref files requiring HTTP Authorization.';

  static readonly args = {
    pattern: Args.string({
      required: true,
      description:
        'Glob pattern for matching protected URLs (e.g. github.com/org/repo/**/*.*)',
    }),
    token: Args.string({
      required: true,
      description:
        'Authentication token or environment variable reference (prefix with $, e.g. $GITHUB_TOKEN)',
    }),
  };

  static readonly flags = {
    'auth-type': Flags.string({
      char: 'a',
      description: 'Authentication type (default is "Bearer")',
    }),
    header: Flags.string({
      char: 'h',
      description:
        'Additional header in key=value format; can be used multiple times',
      multiple: true,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(AuthAdd);

    const isEnvVar = args.token.startsWith('$');
    const tokenValue = isEnvVar ? args.token.slice(1) : args.token;

    // Parse headers into an object
    const headers: Record<string, string> = {};
    if (flags.header) {
      for (const headerEntry of flags.header) {
        const [key, value] = headerEntry.split('=');
        if (key && value) {
          headers[key.trim()] = value.trim();
        } else {
          this.warn(`⚠️ Ignored invalid header format: ${headerEntry}`);
        }
      }
    }

    const entry: AuthEntry = {
      pattern: args.pattern,
      token: tokenValue,
      authType: flags['auth-type'] || 'Bearer',
      headers: Object.keys(headers).length ? headers : undefined,
    };

    try {
      await ConfigService.addAuthEntry(entry);
      this.log(
        `✅ Auth config added for ${blueBright(args.pattern)} using ${
          isEnvVar ? `env var (${tokenValue})` : 'raw token'
        } with auth type ${blueBright(entry.authType || 'Bearer')}`
      );
      if (entry.headers) {
        this.log(`Headers: ${JSON.stringify(entry.headers, null, 2)}`);
      }
    } catch (err) {
      this.error(`❌ Failed to add auth config: ${(err as Error).message}`);
    }
  }
}
