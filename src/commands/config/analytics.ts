import { Flags } from '@oclif/core';
import { readFileSync, writeFile } from 'fs-extra';
import { join, resolve } from 'path';
import Command from '../../base';

export default class Analytics extends Command {
  static description = 'Enable or disable analytics for metrics collection';
  static flags = {
    help: Flags.help({ char: 'h' }),
    disable: Flags.boolean({ char: 'd', description: 'disable analytics', default: false })
  };

  async run() {
    try {
      const { flags } = await this.parse(Analytics);
      const isDisabled = flags.disable;
      const isEnabled = flags.enable;
      const analyticsConfigFile = join(process.cwd(), '.asyncapi-analytics');
      const analyticsConfigFileContent = JSON.parse(readFileSync(resolve(analyticsConfigFile), 'utf-8'));
  
      if (isDisabled) {
        analyticsConfigFileContent.analyticsEnabled = 'false';
        await writeFile(analyticsConfigFile, JSON.stringify(analyticsConfigFileContent), {encoding: 'utf8'});      
        this.log('Analytics disabled.');
      } else if (isEnabled){
        analyticsConfigFileContent.analyticsEnabled = 'true';
        await writeFile(analyticsConfigFile, JSON.stringify(analyticsConfigFileContent), {encoding: 'utf8'});
        this.log('Analytics enabled.');
      }
      
    } catch (e: any) {
      this.error(e as Error);
    }  
  }
}
