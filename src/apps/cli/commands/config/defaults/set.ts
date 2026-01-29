import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { ConfigService } from '@services/config.service';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { green, cyan, yellow } from 'picocolors';

export default class DefaultsSet extends Command {
  static readonly description = 'Set default flags for a command';

  static readonly examples = [
    '$ asyncapi config defaults set validate --log-diagnostics --fail-severity error',
    '$ asyncapi config defaults set generate:fromTemplate --template @asyncapi/html-template --output ./docs',
    '$ asyncapi config defaults set bundle --output ./dist/bundled.yaml',
  ];

  static readonly args = {
    command: Args.string({
      description: 'Command to set defaults for (e.g., validate, generate:fromTemplate)',
      required: true,
    }),
  };

  static readonly flags = helpFlag();
  
  static readonly strict = false;
  static readonly enableJsonFlag = false;

  async run() {
    const rawArgv = process.argv.slice(2);
    
    const setIndex = rawArgv.indexOf('set');
    if (setIndex === -1 || setIndex + 1 >= rawArgv.length) {
      this.error('Command argument required');
    }

    const commandId = rawArgv[setIndex + 1];
    const flagArgs = rawArgv.slice(setIndex + 2);

    if (flagArgs.length === 0) {
      this.error('No flags provided. Specify at least one flag to set as default.\\n\\nExample:\\n  asyncapi config defaults set validate --log-diagnostics --fail-severity error');
    }

    const defaults: Record<string, any> = {};
    
    let i = 0;
    while (i < flagArgs.length) {
      const arg = flagArgs[i];
      
      if (!arg.startsWith('--')) {
        this.warn(yellow(`Skipping non-flag argument: ${arg}`));
        i++;
        continue;
      }
      
      const flagName = arg.replace(/^--/, '');
      
      if (flagName === 'help') {
        i++;
        continue;
      }
      
      if (i + 1 < flagArgs.length && !flagArgs[i + 1].startsWith('--')) {
        defaults[flagName] = flagArgs[i + 1];
        i += 2;
      } else {
        defaults[flagName] = true;
        i++;
      }
    }

    if (Object.keys(defaults).length === 0) {
      this.error('No valid flags provided. Specify at least one flag to set as default.');
    }

    await ConfigService.setCommandDefaults(commandId, defaults);
    
    this.log(green(`✓ Defaults set for command "${commandId}":`));
    this.log(JSON.stringify(defaults, null, 2));
    this.log('');
    this.log(cyan('These defaults will be automatically applied when running the command.'));
    this.log(cyan('CLI flags will still override these defaults.'));
  }
}
