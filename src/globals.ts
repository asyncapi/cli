import chokidar from 'chokidar';
import chalk from 'chalk';
import Command from '@oclif/command';
import { Specification } from './models/SpecificationFile';

const GreenLog = chalk.hex('#00FF00');
const OrangeLog = chalk.hex('#FFA500');
const CHOKIDAR_CONFIG = {
  // awaitWriteFinish: true // Used for large size specification files.

};
const WATCH_MESSAGES = {
  logOnStart: (filePath: string) => console.log(GreenLog(`Watching AsyncAPI file at ${filePath}\n`)),
  logOnChange: (handlerName: string) => console.log(OrangeLog(`Change detected, running ${handlerName}\n`)),
  logOnAutoDisable: (docVersion: 'old' | 'new' | '' = '') => console.log(OrangeLog(`Watch mode for ${docVersion || 'AsyncAPI'} file was not enabled.`), OrangeLog('\nINFO: Watch works only with files from local file system\n'))
};

let IS_CHOKIDAR_INSTANCE_RUNNING = false;

export type specWatcherParams = {
  spec: Specification,
  handler: Command,
  handlerName: string,
  docVersion?: 'old' | 'new';
}

export const specWatcher = (params: specWatcherParams) => {
  if (!params.spec.getFilePath()) { return WATCH_MESSAGES.logOnAutoDisable(params.docVersion); }
  if (IS_CHOKIDAR_INSTANCE_RUNNING) { return;}
  const filePath = params.spec.getFilePath() as string;
  try {
    WATCH_MESSAGES.logOnStart(filePath);
    chokidar
      .watch(filePath, CHOKIDAR_CONFIG)
      .on('change', async () => {
        WATCH_MESSAGES.logOnChange(params.handlerName);
        await params.handler.run();
        WATCH_MESSAGES.logOnStart(filePath);
      });
    IS_CHOKIDAR_INSTANCE_RUNNING = true;
  } catch (error) {
    console.log(error);
  }
};
