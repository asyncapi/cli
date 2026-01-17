import Command from '@cli/internal/base';
import { ConfigService } from '@services/config.service';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { cyan, blueBright } from 'picocolors';

export default class AuthList extends Command {
  static readonly description = 'List configured authentication entries';

  static readonly examples = [
    '$ asyncapi config auth list',
  ];

  static readonly flags = helpFlag();

  async run() {
    await this.parse(AuthList);

    const config = await ConfigService.loadConfig();

    if (!config.auth || config.auth.length === 0) {
      this.log('No authentication configured.');
      this.log('');
      this.log('Add authentication with:');
      this.log(cyan('  asyncapi config auth add --pattern <url-pattern> --type <type> --token-env <env-var>'));
      return;
    }

    this.log(blueBright('Configured authentication:\\n'));

    for (const [index, entry] of config.auth.entries()) {
      this.log(cyan(`${index + 1}. ${entry.pattern}`));
      this.log(`   Type: ${entry.authType || 'Bearer'}`);
      this.log(`   Token: ${entry.token}`);
      
      if (entry.headers && Object.keys(entry.headers).length > 0) {
        this.log('   Custom headers:');
        for (const [key, value] of Object.entries(entry.headers)) {
          this.log(`     ${key}: ${value}`);
        }
      }
      
      this.log('');
    }

    this.log(cyan(`Total: ${config.auth.length} auth entries configured`));
  }
}
