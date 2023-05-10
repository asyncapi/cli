import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as repoRoot from 'app-root-path';

import { ContextNotFound, MissingContextFileError, MissingCurrentContextError } from '../errors/context-error';

const { readFile, writeFile } = fs;

const DEFAULT_CONTEXT_FILENAME = '.asyncapi';
const DEFAULT_CONTEXT_FILE_LOCATION = os.homedir();
const DEFAULT_CONTEXT_FILE_PATH = path.resolve(DEFAULT_CONTEXT_FILE_LOCATION, DEFAULT_CONTEXT_FILENAME);

const CONTEXT_FILENAME = process.env.CUSTOM_CONTEXT_FILENAME || DEFAULT_CONTEXT_FILENAME;
const CONTEXT_FILE_LOCATION = process.env.CUSTOM_CONTEXT_FILE_LOCATION || DEFAULT_CONTEXT_FILE_LOCATION;
const CONTEXT_FILE_PATH = path.resolve(CONTEXT_FILE_LOCATION, CONTEXT_FILENAME);

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
    const context = fileContent.store[String(contextName)];
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
  fileContent.store[String(contextName)] = pathToFile;
  await saveContextFile(fileContent);
}

export async function removeContext(contextName: string) {
  const fileContent = await loadContextFile();
  if (!fileContent.store[String(contextName)]) {
    throw new ContextNotFound(contextName);
  }
  if (fileContent.current === contextName) {
    delete fileContent.current;
  }
  delete fileContent.store[String(contextName)];
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
  if (!fileContent.store[String(contextName)]) {
    throw new ContextNotFound(contextName);
  }
  fileContent.current = contextName;
  await saveContextFile(fileContent);
}

export async function loadContextFile(): Promise<IContextFile> {
  try {
    return JSON.parse(await readFile(await getContextFilePath(), { encoding: 'utf8' })) as IContextFile;
  } catch (e) {
    throw new MissingContextFileError();
  }
}

async function saveContextFile(fileContent: IContextFile) {
  try {
    writeFile(CONTEXT_FILE_PATH, JSON.stringify({
      current: fileContent.current,
      store: fileContent.store
    }), { encoding: 'utf8' });
    return fileContent;
  } catch (error) {
    return;
  }
}

async function getContextFilePath(): Promise<string> {
  const currentPath = process.cwd().slice(repoRoot.path.length + 1).split(path.sep);
  currentPath.unshift(repoRoot.path);

  for (let i = currentPath.length; i >= 0; i--) {
    const currentPathString = currentPath[0]
      ? currentPath.join(path.sep) + path.sep + CONTEXT_FILENAME
      : os.homedir() + path.sep + CONTEXT_FILENAME;

    try {
      if (JSON.parse(await readFile(currentPathString + path.sep + CONTEXT_FILENAME, { encoding: 'utf8' })) as IContextFile) {
        return currentPathString;
      }
    } catch (e) {}

    currentPath.pop();
  }

  return '';
}
