import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as repoRoot from 'app-root-path';

import {
  ContextNotFound,
  MissingContextFileError,
  MissingCurrentContextError,
  ContextFileWrongFormatError,
  ContextAlreadyExistsError,
} from '../errors/context-error';

const { readFile, writeFile } = fs;

const DEFAULT_CONTEXT_FILENAME = '.asyncapi-cli';
const DEFAULT_CONTEXT_FILE_LOCATION = os.homedir();
export const DEFAULT_CONTEXT_FILE_PATH = path.resolve(DEFAULT_CONTEXT_FILE_LOCATION, DEFAULT_CONTEXT_FILENAME);

const CONTEXT_FILENAME = process.env.CUSTOM_CONTEXT_FILENAME ?? DEFAULT_CONTEXT_FILENAME;
const CONTEXT_FILE_LOCATION = process.env.CUSTOM_CONTEXT_FILE_LOCATION ?? DEFAULT_CONTEXT_FILE_LOCATION;

// Usage of promises for assignment of their resolved values to constants is
// known to be troublesome:
// https://www.reddit.com/r/learnjavascript/comments/p7p7zw/assigning_data_from_a_promise_to_a_constant
//
// In this particular case and usage of ES6, there is a race condition during
// code execution, due to faster assignment of default values to
// `CONTEXT_FILE_PATH` than resolution of the promise. This is the cause
// `CONTEXT_FILE_PATH` will always pick default values for context file's path
// instead of waiting for resolution of the promise from `getContextFilePath()`.
// The situation might become better with use of top-level await which should
// pause code execution, until promise in construction
//
// const CONTEXT_FILE_PATH = await getContextFilePath() || path.resolve(CONTEXT_FILE_LOCATION, CONTEXT_FILENAME) || DEFAULT_CONTEXT_FILE_PATH;
//
// is resolved, but for this to be checked, all codebase (including
// `@oclif/core`) needs to be migrated to ES2022 or higher.
//
// Until then `CONTEXT_FILE_PATH` name is mimicking a `const` while right now it
// is a `let` reassigned inside of `getContextFilePath()`.
export let CONTEXT_FILE_PATH = path.resolve(CONTEXT_FILE_LOCATION, CONTEXT_FILENAME) || DEFAULT_CONTEXT_FILE_PATH;
// Sonar recognizes next line as a bug `Promises must be awaited, end with a
// call to .catch, or end with a call to .then with a rejection handler.` but
// due to absence of top-level await in ES6, this bug cannot be fixed without
// migrating the codebase to ES2022 or higher, thus suppressing Sonar analysis
// for this line.
getContextFilePath(); // NOSONAR

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
  const fileContent: IContextFile = await loadContextFile();
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
    // If context file already has context name similar to the one specified as
    // an argument, notify user about it (throw `ContextAlreadyExistsError()`
    // error) and exit.
    if (fileContent.store.hasOwnProperty.call(fileContent.store, contextName)) {
      throw new ContextAlreadyExistsError(contextName, CONTEXT_FILE_PATH);
    }
  } catch (e) {
    if (e instanceof MissingContextFileError) {
      fileContent = {
        store: {
          [contextName]: pathToFile,
        }
      };
    } else {
      throw e;
    }
  }
  fileContent.store[String(contextName)] = pathToFile;
  await saveContextFile(fileContent);
}

export async function removeContext(contextName: string) {
  const fileContent: IContextFile = await loadContextFile();
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
  const fileContent: IContextFile = await loadContextFile();
  const context = await loadContext();
  return {
    current: fileContent.current as string,
    context,
  };
}

export async function setCurrentContext(contextName: string) {
  const fileContent: IContextFile = await loadContextFile();
  if (!fileContent.store[String(contextName)]) {
    throw new ContextNotFound(contextName);
  }
  fileContent.current = contextName;
  await saveContextFile(fileContent);
}

export async function loadContextFile(): Promise<IContextFile> {
  // If the context file cannot be read, then it's a 'MissingContextFileError'
  // error.
  try {
    await readFile(CONTEXT_FILE_PATH, { encoding: 'utf8' });
  } catch (e) {
    throw new MissingContextFileError();
  }
  // If the context file cannot be parsed, then it's a
  // 'ContextFileWrongFormatError' error.
  try {
    const fileContent: IContextFile = JSON.parse(
      await readFile(CONTEXT_FILE_PATH, { encoding: 'utf8' })
    );
    if (await isContextFileValid(fileContent)) {
      return fileContent;
    }
    // This `throw` is for `isContextFileValid()`.
    throw new ContextFileWrongFormatError(CONTEXT_FILE_PATH);
  } catch (e) {
    // This `throw` is for `JSON.parse()`.
    // https://stackoverflow.com/questions/29797946/handling-bad-json-parse-in-node-safely
    throw new ContextFileWrongFormatError(CONTEXT_FILE_PATH);
  }
}

async function saveContextFile(fileContent: IContextFile) {
  try {
    await writeFile(CONTEXT_FILE_PATH, JSON.stringify({
      current: fileContent.current,
      store: fileContent.store
    }), { encoding: 'utf8' });
    return fileContent;
  } catch (e) {
    return;
  }
}

async function getContextFilePath(): Promise<string | null> {
  const currentPath = process
    .cwd()
    .slice(repoRoot.path.length + 1)
    .split(path.sep);
  currentPath.unshift(repoRoot.path);

  for (let i = currentPath.length; i >= 0; i--) {
    const currentPathString = currentPath[0]
      ? currentPath.join(path.sep) + path.sep + CONTEXT_FILENAME
      : os.homedir() + path.sep + CONTEXT_FILENAME;

    // This `try...catch` is a part of `for` loop and is used only to swallow
    // errors if the file does not exist or cannot be read, to continue
    // uninterrupted execution of the loop. For validation of context file's
    // format is responsible `isContextFileValid()`.
    try {
      // Paths to both [existing / can be read] files and files with size of 0
      // bytes should be returned. Files sized zero bytes are still subject to
      // validation by `isContextFileValid()`, while [non-existence /
      // impossibility to read] are subject to returning `null`.
      if (
        (await readFile(currentPathString, { encoding: 'utf8' })) ||
        (await readFile(currentPathString, { encoding: 'utf8' })) === ''
      ) {
        CONTEXT_FILE_PATH = currentPathString;
        return CONTEXT_FILE_PATH;
      }
    } catch (e) {} // eslint-disable-line

    currentPath.pop();
  }
  return null;
}

export async function isContextFileValid(
  fileContent: IContextFile
): Promise<boolean> {
  // Validation of context file's format against interface `IContextFile`.
  return (
    Object.keys(fileContent).length !== 0 &&
    Object.keys(fileContent).length <= 2 &&
    fileContent.hasOwnProperty.call(fileContent, 'store') &&
    !Array.from(Object.keys(fileContent.store)).find(
      (elem) => typeof elem !== 'string'
    ) &&
    !Array.from(Object.values(fileContent.store)).find(
      (elem) => typeof elem !== 'string'
    )
  );
}
