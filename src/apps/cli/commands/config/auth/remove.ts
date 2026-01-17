import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { ConfigService } from '@services/config.service';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { green } from 'picocolors';

export default class AuthRemove extends Command {
  static description = 'Remove authentication for a URL pattern';

  static examples = [
    '$ asyncapi config auth remove "https://schema-registry.company.com/*"',
    '$ asyncapi config auth remove "https://github.com/myorg/*"',
  ];

  static args = {
    pattern: Args.string({
      description: 'URL pattern to remove authentication for',
      required: true,
    }),
  };

  static flags = helpFlag();

  async run() {
    const { args } = await this.parse(AuthRemove);
    const pattern = args.pattern;

    const config = await ConfigService.loadConfig();

    if (!config.auth || config.auth.length === 0) {
      this.error('No authentication configured.');
    }

    const initialLength = config.auth.length;
    config.auth = config.auth.filter(entry => entry.pattern !== pattern);

    if (config.auth.length === initialLength) {
      this.error(`No authentication found for pattern: ${pattern}`);
    }

    await ConfigService.saveConfig(config);

    this.log(green(`✓ Authentication removed for pattern: ${pattern}`));
  }
}
