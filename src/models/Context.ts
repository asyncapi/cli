import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

import { ContextNotFound, MissingContextFileError, MissingCurrentContextError } from '../errors/context-error';

const { readFile, writeFile } = fs;
const isTestEnv = !!process.env.TEST;
const CONTEXT_FILENAME = isTestEnv ? '.test.asyncapi' : '.asyncapi';
export const DEFAULT_CONTEXT_FILE_PATH = path.resolve(os.homedir(), CONTEXT_FILENAME);

export interface IContextFile {
  current?: string,
  readonly store: {
    [name: string]: string
  }
}

export interface ICurrentContext {
  readonly current: string,
  readonly context: string
}

export async function loadContext(contextName?: string): Promise<string> {
  const fileContent = await loadContextFile();
  if (contextName) {
    const context = fileContent.store[contextName];
    if (!context) {throw new ContextNotFound(contextName);}
    return context;
  } else if (fileContent.current) {
    const context = fileContent.store[fileContent.current];
    if (!context) {throw new ContextNotFound(fileContent.current);}
    return context;
  }

  throw new MissingCurrentContextError();
}

export async function addContext(contextName: string, pathToFile: string) {
  let fileContent: IContextFile;

  try {
    fileContent = await loadContextFile();
  } catch (err) {
    if (err instanceof MissingContextFileError) {
      fileContent = {
        store: {
          [contextName]: pathToFile,
        }
      };
    } else {
      throw err;
    }
  }
  fileContent.store[contextName] = pathToFile;
  await saveContextFile(fileContent);
}

export async function removeContext(contextName: string) {
  const fileContent = await loadContextFile();
  if (!fileContent.store[contextName]) {
    throw new ContextNotFound(contextName);
  }
  if (fileContent.current === contextName) {
    delete fileContent.current;
  }
  delete fileContent.store[contextName];
  await saveContextFile(fileContent);
}

export async function getCurrentContext(): Promise<ICurrentContext> {
  const fileContent = await loadContextFile();
  const context = await loadContext();
  return {
    current: fileContent.current as string,
    context,
  };
}

export async function setCurrentContext(contextName: string) {
  const fileContent = await loadContextFile();
  if (!fileContent.store[contextName]) {
    throw new ContextNotFound(contextName);
  }
  fileContent.current = contextName;
  await saveContextFile(fileContent);
}

export async function loadContextFile(): Promise<IContextFile> {
  try {
    return JSON.parse(await readFile(DEFAULT_CONTEXT_FILE_PATH, { encoding: 'utf8' })) as IContextFile;
  } catch (e) {
    throw new MissingContextFileError();
  }
}

async function saveContextFile(fileContent: IContextFile) {
  try {
    writeFile(DEFAULT_CONTEXT_FILE_PATH, JSON.stringify({
      current: fileContent.current,
      store: fileContent.store
    }), { encoding: 'utf8' });
    return fileContent;
  } catch (error) {
    return;
  }
}
