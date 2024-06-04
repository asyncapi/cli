import { Flags } from '@oclif/core';
import { join, resolve } from 'path';
import Command from '../../core/base';
import { promises as fPromises } from 'fs';
import { homedir } from 'os';

const { readFile, writeFile } = fPromises;

export default class Analytics extends Command {
  static readonly description = 'Enable or disable analytics for metrics collection';
  static readonly flags = {
    help: Flags.help({ char: 'h' }),
    disable: Flags.boolean({ char: 'd', description: 'disable analytics', default: false }),
    enable: Flags.boolean({ char: 'e', description: 'enable analytics', default: false }),
    status: Flags.boolean({ char: 's', description: 'show current status of analytics' }),

  };

  async run() {
    const { flags } = await this.parse(Analytics);
    const analyticsConfigFile = process.env.ASYNCAPI_METRICS_CONFIG_PATH || join(homedir(), '.asyncapi-analytics');

    try {
      const analyticsConfigFileContent = JSON.parse(await readFile(resolve(analyticsConfigFile), { encoding: 'utf8' }));

      if (flags.disable) {
        analyticsConfigFileContent.analyticsEnabled = 'false';
        this.log('\nAnalytics disabled.\n');
        this.metricsMetadata.analytics_disabled = flags.disable;
      } else if (flags.enable) {
        analyticsConfigFileContent.analyticsEnabled = 'true';
        this.log('\nAnalytics enabled.\n');
        this.metricsMetadata.analytics_enabled = flags.enable;
      } else if (!flags.status) {
        this.log('\nPlease append the "--disable" flag to the command in case you prefer to disable analytics, or use the "--enable" flag if you want to enable analytics back again. In case you do not know the analytics current status, then you can append the "--status" flag to be aware of it.\n');
        return;
      }
      await writeFile(analyticsConfigFile, JSON.stringify(analyticsConfigFileContent), { encoding: 'utf8' });

      if (flags.status) {
        if (analyticsConfigFileContent.analyticsEnabled === 'true') {
          this.log('\nAnalytics are enabled.\n');
        } else {
          this.log('\nAnalytics are disabled. Please append the "--enable" flag to the command in case you prefer to enable analytics.\n');
        }
        this.metricsMetadata.analytics_status_checked = flags.status;
      }
    } catch (e: any) {
      switch (e.code) {
      case 'ENOENT':
        this.error(`Unable to access the analytics configuration file. We tried to access the ".asyncapi-analytics" file in in the path "${analyticsConfigFile}" but the file could not be found.`);
        break;
      case 'EEXIST':
        this.error(`Unable to update the analytics configuration file. We tried to update your ".asyncapi-analytics" file in the path "${analyticsConfigFile}" but the file does not exist.`);
        break;
      default:
        this.error(`Unable to change your analytics configuration. Please check the following message for further info about the error:\n\n${e}`);
      }
    }
  }
}
