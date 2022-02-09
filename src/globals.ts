import chokidar from 'chokidar';
import chalk from 'chalk';

const GreenLog = chalk.hex('#00FF00');
const OrangeLog = chalk.hex('#FFA500');

export const specWatcher = (filePath: string, handler: any, handlerName: string) => {
  const CHOKIDAR_CONFIG = {
    awaitWriteFinish: true
  };
  const WATCH_MESSAGES = {
    logOnStart: (filePath: string) => console.log(GreenLog(`Watching AsyncAPI file at ${filePath}`)),
    logOnChange: (handlerName: string) => console.log(OrangeLog(`Changed: Specification, running ${handlerName}`)),
  };
  
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
