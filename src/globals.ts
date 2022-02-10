import chokidar from 'chokidar';
import chalk from 'chalk';
import Command from '@oclif/command';

export const GreenLog = chalk.hex('#00FF00');
export const OrangeLog = chalk.hex('#FFA500');
export const RedLog = chalk.hex('#FF0000');
const CHOKIDAR_CONFIG = {
  // awaitWriteFinish: true
};
export const WATCH_MESSAGES = {
  logOnStart: (filePath: string) => console.log(GreenLog(`Watching AsyncAPI file at ${filePath}`)),
  logOnChange: (handlerName: string) => console.log(OrangeLog(`Change detected, running ${handlerName}`)),
  logOnAutoDisable: (documentname: 'first' | 'second') => console.log(RedLog(`**Watch mode auto-disabled** for ${documentname} AsyncAPI File.\n`), OrangeLog('INFO: Watch mode only watches local AsyncAPI Files\n'))
};

export const specWatcher = (filePath: string, handler: Command, handlerName: string) => {
  try {
    WATCH_MESSAGES.logOnStart(filePath);
    chokidar
      .watch(filePath, CHOKIDAR_CONFIG)
      .on('change', async () => {
        WATCH_MESSAGES.logOnChange(handlerName);
        await handler.run();
      });
  } catch (error) {
    console.log(error);
  }
};
