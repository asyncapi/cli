import chokidar from 'chokidar';
import chalk from 'chalk';
import Command from './base';
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

const CHOKIDAR_INSTANCE_STORE = new Map<string, boolean>();

export type specWatcherParams = {
  spec: Specification,
  handler: Command,
  handlerName: string,
  label?: string,
  docVersion?: 'old' | 'new';
}

export const specWatcher = (params: specWatcherParams) => {
  if (!params.spec.getFilePath()) { return WATCH_MESSAGES.logOnAutoDisable(params.docVersion); }
  if (CHOKIDAR_INSTANCE_STORE.get(params.label || '_default')) { return; }

  const filePath = params.spec.getFilePath() as string;
  try {
    WATCH_MESSAGES.logOnStart(filePath);
    chokidar
      .watch(filePath, CHOKIDAR_CONFIG)
      .on('change', async () => {
        WATCH_MESSAGES.logOnChange(params.handlerName);
        try {
          await params.handler.run();
        } catch (err) {
          await params.handler.catch(err);
        }
      });
    CHOKIDAR_INSTANCE_STORE.set(params.label || '_default', true);
  } catch (error) {
    console.log(error);
  }
};

