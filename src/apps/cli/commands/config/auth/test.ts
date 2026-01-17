import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { ConfigService } from '@services/config.service';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { green, yellow, cyan } from 'picocolors';

export default class AuthTest extends Command {
  static description = 'Test which auth entry matches a URL';

  static examples = [
    '$ asyncapi config auth test "https://schema-registry.company.com/schemas/user.yaml"',
    '$ asyncapi config auth test "https://github.com/myorg/repo/blob/main/schema.yaml"',
  ];

  static args = {
    url: Args.string({
      description: 'URL to test',
      required: true,
    }),
  };

  static flags = helpFlag();

  async run() {
    const { args } = await this.parse(AuthTest);
    const url = args.url;

    this.log(`Testing URL: ${cyan(url)}\n`);

    const authResult = await ConfigService.getAuthForUrl(url);

    if (!authResult) {
      this.log(yellow('✗ No matching authentication found'));
      this.log('');
      this.log('Add authentication with:');
      this.log('  asyncapi config auth add --pattern <url-pattern> --type <type> --token-env <env-var>');
      return;
    }

    this.log(green('✓ Authentication found!'));
    this.log('');
    this.log(`  Type: ${authResult.authType}`);
    
    if (authResult.token) {
      const displayToken = authResult.token.length > 10 
        ? authResult.token.substring(0, 10) + '...' 
        : authResult.token;
      this.log(`  Token: ${displayToken}`);
    } else {
      this.log(yellow(`  Token: (not set - check environment variable)`));
    }
    
    if (Object.keys(authResult.headers).length > 0) {
      this.log(`  Headers:`);
      for (const [key, value] of Object.entries(authResult.headers)) {
        this.log(`    ${key}: ${value}`);
      }
    }
  }
}
