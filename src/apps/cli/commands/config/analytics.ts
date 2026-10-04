import { join, resolve } from 'path';
import Command from '@cli/internal/base';
import { promises as fPromises } from 'fs';
import { homedir } from 'os';
import { analyticsFlags } from '@cli/internal/flags/config/analytics.flags';
import { blueBright, redBright } from 'picocolors';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

const { readFile, writeFile } = fPromises;

export default class Analytics extends Command {
  static readonly description =
    'Enable or disable analytics for metrics collection';
  static readonly flags = analyticsFlags();

  async run() {
    const { flags } = await this.parse(Analytics);
    const analyticsConfigFile =
      process.env.ASYNCAPI_METRICS_CONFIG_PATH ||
      join(homedir(), '.asyncapi-analytics');

    try {
      const analyticsConfigFileContent = JSON.parse(
        await readFile(resolve(analyticsConfigFile), { encoding: 'utf8' }),
      );
      const wasEnabled = analyticsConfigFileContent.analyticsEnabled === 'true';
      let changed = false;
      let message = 'Analytics status checked.';

      if (flags.disable) {
        analyticsConfigFileContent.analyticsEnabled = 'false';
        this.log('\nAnalytics disabled.\n');
        this.metricsMetadata.analytics_disabled = flags.disable;
        changed = wasEnabled;
        message = 'Analytics disabled.';
      } else if (flags.enable) {
        analyticsConfigFileContent.analyticsEnabled = 'true';
        this.log('\nAnalytics enabled.\n');
        this.metricsMetadata.analytics_enabled = flags.enable;
        changed = !wasEnabled;
        message = 'Analytics enabled.';
      } else if (!flags.status) {
        const infoMessage = `Please append the ${blueBright('--disable')} flag to the command if you prefer to disable analytics, or use the ${blueBright('--enable')} flag if you want to enable analytics again. To check the current analytics status, use the ${blueBright('--status')} flag.`;
        this.log(`\n${infoMessage}\n`);
        return this.result('Analytics configuration unchanged.', {
          enabled: wasEnabled,
          changed: false,
          configPath: resolve(analyticsConfigFile),
          warnings: [],
        });
      }
      await writeFile(
        analyticsConfigFile,
        JSON.stringify(analyticsConfigFileContent),
        { encoding: 'utf8' },
      );

      if (flags.status) {
        if (analyticsConfigFileContent.analyticsEnabled === 'true') {
          this.log('\nAnalytics are enabled.\n');
        } else {
          this.log(
            `\n${redBright('Analytics are disabled.')} To enable analytics, use the ${blueBright('--enable')} flag.\n`,
          );
        }
        this.metricsMetadata.analytics_status_checked = flags.status;
      }
      return this.result(message, {
        enabled: analyticsConfigFileContent.analyticsEnabled === 'true',
        changed,
        configPath: resolve(analyticsConfigFile),
        warnings: [],
      });
    } catch (e: any) {
      // Preserve the historical `Error:` prefix of oclif's string errors.
      switch (e.code) {
      case 'ENOENT':
        throw Object.assign(
          new ApplicationError(
            CLI_ERROR_CODES.CONFIG_FILE_NOT_FOUND,
            `Unable to access the analytics configuration file. We tried to access the ${blueBright('.asyncapi-analytics')} file in the path "${blueBright(analyticsConfigFile)}" but the file could not be found.`,
            { cause: e },
          ),
          { name: 'Error' },
        );
      case 'EEXIST':
        throw Object.assign(
          new ApplicationError(
            CLI_ERROR_CODES.CONFIG_WRITE_FAILED,
            `Unable to update the analytics configuration file. We tried to update your ".asyncapi-analytics" file in the path "${blueBright(analyticsConfigFile)}" but the file does not exist.`,
            { cause: e },
          ),
          { name: 'Error' },
        );
      default:
        throw Object.assign(
          new ApplicationError(
            CLI_ERROR_CODES.CONFIG_WRITE_FAILED,
            `Unable to change your analytics configuration. Please check the following message for further info about the error:\n\n${redBright(e)}`,
            { cause: e },
          ),
          { name: 'Error' },
        );
      }
    }
  }
}
