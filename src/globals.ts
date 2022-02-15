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

type CHOKIDAR_INSTANCE_STORE = Record<string, boolean>

const IS_CHOKIDAR_INSTANCE_RUNNING: CHOKIDAR_INSTANCE_STORE = {
  _default: false,
};

export type specWatcherParams = {
  spec: Specification,
  handler: Command,
  handlerName: string,
  label?: string,
  docVersion?: 'old' | 'new';
}

const getLabelValue = (label: string): boolean => {
  return IS_CHOKIDAR_INSTANCE_RUNNING[label as string];
};
const setLabelValue = (label: string, val: boolean) => {
  IS_CHOKIDAR_INSTANCE_RUNNING[label as string] = val;
};

export const specWatcher = (params: specWatcherParams) => {
  if (!params.spec.getFilePath()) { return WATCH_MESSAGES.logOnAutoDisable(params.docVersion); }
  if (!params.label && getLabelValue('_default')) { return; }
  if (params.label && getLabelValue(params.label as string)) { return; }

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
    if (params.label) {
      setLabelValue(params.label, true);
    } else {
      setLabelValue('_default', true);
    }
  } catch (error) {
    console.log(error);
  }
};

