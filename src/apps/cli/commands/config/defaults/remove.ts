import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { ConfigService } from '@services/config.service';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { green } from 'picocolors';

export default class DefaultsRemove extends Command {
  static description = 'Remove defaults for a command';

  static examples = [
    '$ asyncapi config defaults remove validate',
    '$ asyncapi config defaults remove generate:fromTemplate',
  ];

  static args = {
    command: Args.string({
      description: 'Command to remove defaults for',
      required: true,
    }),
  };

  static flags = helpFlag();

  async run() {
    const { args } = await this.parse(DefaultsRemove);
    const commandId = args.command;

    const allDefaults = await ConfigService.listAllDefaults();
    
    if (!allDefaults[commandId]) {
      this.error(`No defaults configured for command "${commandId}"`);
    }

    await ConfigService.removeCommandDefaults(commandId);
    
    this.log(green(`✓ Defaults removed for command "${commandId}"`));
  }
}
