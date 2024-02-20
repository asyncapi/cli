import { Flags } from '@oclif/core';
import { join, resolve } from 'path';
import Command from '../../base';
import { promises as fPromises } from 'fs';

const { readFile, writeFile } = fPromises;

export default class Analytics extends Command {
  static description = 'Enable or disable analytics for metrics collection';
  static flags = {
    help: Flags.help({ char: 'h' }),
    disable: Flags.boolean({ char: 'd', description: 'disable analytics', default: false }),
    enable: Flags.boolean({ char: 'e', description: 'enable analytics', default: false }),
  };

  async run() {
    const { flags } = await this.parse(Analytics);
    const analyticsConfigFile = join(process.cwd(), '.asyncapi-analytics');

    try {
      const analyticsConfigFileContent = JSON.parse(await readFile(resolve(analyticsConfigFile), { encoding: 'utf8' }));

      if (flags.disable) {
        analyticsConfigFileContent.analyticsEnabled = 'false';
        this.log('Analytics disabled.');
      } else if (flags.enable) {
        analyticsConfigFileContent.analyticsEnabled = 'true';
        this.log('Analytics enabled.');
      } else {
        this.log('\nPlease append the "--disable" flag to the command in case you prefer to disable analytics, or use the "--enable" flag if you want to enable analytics back again.\n');
        return;
      }
      
      await writeFile(analyticsConfigFile, JSON.stringify(analyticsConfigFileContent), { encoding: 'utf8' });      

    } catch (e: any) {
      switch (e.code) {
        case'ENOENT':
          this.error(`Unable to access the analytics configuration file. We tried to access the ".asyncapi-analytics" file in your current working directory ("${process.cwd()}") but the file could not be found.`);
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
