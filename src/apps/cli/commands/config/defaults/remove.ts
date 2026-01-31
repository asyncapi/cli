import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { ConfigService } from '@services/config.service';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { green } from 'picocolors';

export default class DefaultsRemove extends Command {
  static readonly description = 'Remove defaults for a command';

  static readonly examples = [
    '$ asyncapi config defaults remove validate',
    '$ asyncapi config defaults remove generate:fromTemplate',
  ];

  static readonly args = {
    command: Args.string({
      description: 'Command to remove defaults for',
      required: true,
    }),
  };

  static readonly flags = helpFlag();

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
