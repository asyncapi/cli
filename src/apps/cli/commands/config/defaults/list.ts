import Command from '@cli/internal/base';
import { ConfigService } from '@services/config.service';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { blueBright, cyan } from 'picocolors';

export default class DefaultsList extends Command {
  static description = 'List all configured command defaults';

  static examples = [
    '$ asyncapi config defaults list',
  ];

  static flags = helpFlag();

  async run() {
    await this.parse(DefaultsList);

    const allDefaults = await ConfigService.listAllDefaults();

    if (Object.keys(allDefaults).length === 0) {
      this.log('No command defaults configured.');
      this.log('');
      this.log('Set defaults with:');
      this.log(`  ${cyan('asyncapi config defaults set <command> [flags]')}`);
      return;
    }

    this.log('Configured command defaults:\n');
    
    for (const [commandId, defaults] of Object.entries(allDefaults)) {
      this.log(`${blueBright(commandId)}:`);
      this.log(JSON.stringify(defaults, null, 2));
      this.log('');
    }

    this.log(cyan(`Total: ${Object.keys(allDefaults).length} commands configured`));
  }
}
