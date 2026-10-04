import Command from '@cli/internal/base';
import {
  loadContextFile,
  isContextFileEmpty,
  CONTEXT_FILE_PATH,
} from '@models/Context';
import { MissingContextFileError } from '@errors/context-error';
import { helpFlag } from '@cli/internal/flags/global.flags';
import { blueBright } from 'picocolors';
import { resolve } from 'node:path';

export default class ContextList extends Command {
  static readonly description = 'List all the stored contexts in the store';
  static readonly flags = helpFlag();

  async run() {
    await this.parse(ContextList);
    try {
      const fileContent = await loadContextFile();

      if (await isContextFileEmpty(fileContent)) {
        const message = `Context file ${blueBright(CONTEXT_FILE_PATH)} is empty.`;
        this.log(message);
        return this.result('No contexts are configured.', {
          contexts: [],
          contextFile: CONTEXT_FILE_PATH,
          warnings: [{ code: 'CONTEXT_FILE_EMPTY', message }],
        }, 'warning');
      }

      const contexts = Object.entries(fileContent.store).map(([name, path]) => ({
        name,
        path: resolve(path),
        current: fileContent.current === name,
      }));
      if (fileContent) {
        for (const [contextName, filePath] of Object.entries(fileContent.store)) {
          this.log(`${blueBright(contextName)}: ${filePath}`);
        }
      }
      return this.result('Contexts retrieved.', {
        contexts,
        contextFile: CONTEXT_FILE_PATH,
        warnings: [],
      });
    } catch (e) {
      if (e instanceof MissingContextFileError) {
        const message = `Unable to list contexts. You have no context file configured.\nRun ${blueBright('asyncapi config context init')} to initialize it.`;
        this.log(`${message}\n`);
        return this.result('No context file is configured.', {
          contexts: [],
          contextFile: CONTEXT_FILE_PATH,
          warnings: [{ code: 'CONTEXT_FILE_NOT_FOUND', message }],
        }, 'warning');
      }
      throw e;
    }
  }
}
