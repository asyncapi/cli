import chokidar from 'chokidar';
import chalk from 'chalk';
import Command from './base';
import { Specification } from '@models/SpecificationFile';
import { getErrorMessage } from '@utils/error-handler';
import {
  isStructuredOutput,
  StructuredOutput,
} from './output/types';

const GreenLog = chalk.hex('#00FF00');
const OrangeLog = chalk.hex('#FFA500');
const CHOKIDAR_CONFIG = {
  // awaitWriteFinish: true // Used for large size specification files.
};
const WATCH_MESSAGES = {
  logOnStart: (filePath: string) =>
    console.log(GreenLog(`Watching AsyncAPI file at ${filePath}\n`)),
  logOnChange: (handlerName: string) =>
    console.log(OrangeLog(`Change detected, running ${handlerName}\n`)),
  logOnAutoDisable: (docVersion: 'old' | 'new' | '' = '') =>
    console.log(
      OrangeLog(
        `Watch mode for ${docVersion || 'AsyncAPI'} file was not enabled.`,
      ),
      OrangeLog('\nINFO: Watch works only with files from local file system\n'),
    ),
};

const CHOKIDAR_INSTANCE_STORE = new Map<string, boolean>();
const WATCH_RERUNS = new WeakSet<Command>();

export type SpecWatcherParams = {
  spec: Specification;
  handler: Command;
  handlerName: string;
  label?: string;
  docVersion?: 'old' | 'new';
};

export const isWatchRerun = (handler: Command): boolean =>
  WATCH_RERUNS.has(handler);

export const emitWatchStarted = (
  handler: Command,
  output: StructuredOutput,
  watchedFiles: string[],
): void => {
  const event: StructuredOutput = {
    ...output,
    data: {
      ...(output.data ?? {}),
      event: 'watch.started',
      watchedFiles,
    },
  };
  handler.emitStructuredOutput(event);
};

export const specWatcher = (params: SpecWatcherParams) => {
  if (!params.spec.getFilePath()) {
    if (params.handler.jsonEnabled()) {
      params.handler.emitStructuredError(
        new Error(`Watch mode for ${params.docVersion || 'AsyncAPI'} file was not enabled.`),
      );
      return;
    }
    return WATCH_MESSAGES.logOnAutoDisable(params.docVersion);
  }
  if (CHOKIDAR_INSTANCE_STORE.get(params.label ?? '_default')) {
    return;
  }

  const filePath = params.spec.getFilePath() as string;
  try {
    if (!params.handler.jsonEnabled()) {
      WATCH_MESSAGES.logOnStart(filePath);
    }
    chokidar.watch(filePath, CHOKIDAR_CONFIG).on('change', async () => {
      if (WATCH_RERUNS.has(params.handler)) {
        return;
      }

      const json = params.handler.jsonEnabled();
      if (json) {
        const event: StructuredOutput = {
          status: 'success',
          message: `Change detected, running ${params.handlerName}.`,
          data: { event: 'file.changed', path: filePath },
          errors: [],
        };
        params.handler.emitStructuredOutput(event);
      } else if (params.handlerName) {
        WATCH_MESSAGES.logOnChange(params.handlerName);
      }

      const previousExitCode = process.exitCode;
      WATCH_RERUNS.add(params.handler);
      try {
        const result = await params.handler.run();
        if (json && isStructuredOutput(result)) {
          params.handler.emitStructuredOutput({
            ...result,
            data: {
              ...(result.data ?? {}),
              event: 'command.completed',
            },
          });
        }
      } catch (err: unknown) {
        if (json) {
          params.handler.emitStructuredError(err);
        } else {
          await params.handler.catch(err as Error);
        }
      } finally {
        WATCH_RERUNS.delete(params.handler);
        process.exitCode = previousExitCode;
      }
    });
    CHOKIDAR_INSTANCE_STORE.set(params.label || '_default', true);
  } catch (error: unknown) {
    if (params.handler.jsonEnabled()) {
      params.handler.emitStructuredError(error);
    } else {
      console.error(chalk.red(`Watch error: ${getErrorMessage(error)}`));
    }
  }
};
