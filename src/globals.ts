import chokidar from 'chokidar';
import chalk from 'chalk';
import Command from '@oclif/command';
import { Specification } from './models/SpecificationFile';

const GreenLog = chalk.hex('#00FF00');
const OrangeLog = chalk.hex('#FFA500');
const CHOKIDAR_CONFIG = {
  // awaitWriteFinish: true
};
const WATCH_MESSAGES = {
  logOnStart: (filePath: string) => console.log(GreenLog(`Watching AsyncAPI file at ${filePath}\n`)),
  logOnChange: (handlerName: string) => console.log(OrangeLog(`Change detected, running ${handlerName}\n`)),
  logOnAutoDisable: (docVersion: 'old' | 'new' | ''='') => console.log(OrangeLog(`Watch mode for ${docVersion} file was not enabled..\n`), OrangeLog('INFO: Watch works only with files from local file system\n'))
};

export type specWatcherParams = {
  spec:Specification,
  handler:Command,
  handlerName: string,
  docVersion?: 'old' | 'new' | ''
}

export const specWatcher = (params:specWatcherParams) => {
  if (!params.spec.getFilePath()) {return WATCH_MESSAGES.logOnAutoDisable(params.docVersion);}

  const filePath = params.spec.getFilePath() as string;
  try {
    WATCH_MESSAGES.logOnStart(filePath);
    chokidar
      .watch(filePath, CHOKIDAR_CONFIG)
      .on('change', async () => {
        WATCH_MESSAGES.logOnChange(params.handlerName);
        await params.handler.run();
      });
  } catch (error) {
    console.log(error);
  }
};
