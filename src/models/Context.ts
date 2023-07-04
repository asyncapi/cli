import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as repoRoot from 'app-root-path';

import {
  ContextNotFoundError,
  MissingContextFileError,
  MissingCurrentContextError,
  ContextFileWrongFormatError,
  ContextAlreadyExistsError,
  ContextFileEmptyError,
  ContextFileWriteError,
} from '../errors/context-error';

const { readFile, writeFile } = fs;

const DEFAULT_CONTEXT_FILENAME = '.asyncapi-cli';
const DEFAULT_CONTEXT_FILE_LOCATION = os.homedir();
export const DEFAULT_CONTEXT_FILE_PATH = path.resolve(
  DEFAULT_CONTEXT_FILE_LOCATION,
  DEFAULT_CONTEXT_FILENAME
);

const CONTEXT_FILENAME =
  process.env.CUSTOM_CONTEXT_FILENAME || DEFAULT_CONTEXT_FILENAME;
const CONTEXT_FILE_LOCATION =
  process.env.CUSTOM_CONTEXT_FILE_LOCATION || DEFAULT_CONTEXT_FILE_LOCATION;

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
export let CONTEXT_FILE_PATH =
  path.resolve(CONTEXT_FILE_LOCATION, CONTEXT_FILENAME) ||
  DEFAULT_CONTEXT_FILE_PATH;

// Sonar recognizes next line as a bug `Promises must be awaited, end with a
// call to .catch, or end with a call to .then with a rejection handler.` but
// due to absence of top-level await in ES6, this bug cannot be fixed without
// migrating the codebase to ES2022 or higher, thus suppressing Sonar analysis
// for this line.
getContextFilePath(); // NOSONAR

export interface IContextFile {
  current?: string;
  readonly store: {
    [name: string]: string;
  };
}

export interface ICurrentContext {
  readonly current: string;
  readonly context: string;
}

export async function initContext(
  contextFilePath: string,
  contextName: string,
  specFilePath: string
) {
  let fileContent: IContextFile = {
    store: {},
  };
  let contextWritePath = '';

  // prettier-ignore
  switch (contextFilePath) {
  /* eslint-disable indent */
    case '.':
      contextWritePath = process.cwd() + path.sep + CONTEXT_FILENAME;
      break;
    case './':
      contextWritePath = repoRoot.path + path.sep + CONTEXT_FILENAME;
      break;
    case os.homedir():
      contextWritePath = os.homedir() + path.sep + CONTEXT_FILENAME;
      break;
    case '~':
      contextWritePath = os.homedir() + path.sep + CONTEXT_FILENAME;
      break;
    default:
      contextWritePath = process.cwd() + path.sep + CONTEXT_FILENAME;
  }

  if (contextName && specFilePath) {
    fileContent = {
      store: {
        [String(contextName)]: String(specFilePath),
      },
    };
  }

  try {
    await writeFile(contextWritePath, JSON.stringify(fileContent), {
      encoding: 'utf8',
    });
  } catch (e) {
    throw new ContextFileWriteError(contextWritePath);
  }

  return contextWritePath;
}

export async function loadContext(contextName?: string): Promise<string> {
  const fileContent: IContextFile = await loadContextFile();
  if (contextName) {
    const context = fileContent.store[String(contextName)];
    if (!context) {
      throw new ContextNotFoundError(contextName);
    }
    return context;
  } else if (fileContent.current) {
    const context = fileContent.store[fileContent.current];
    if (!context) {
      throw new ContextNotFoundError(fileContent.current);
    }
    return context;
  }
  throw new MissingCurrentContextError();
}

export async function addContext(contextName: string, pathToFile: string) {
  const fileContent: IContextFile = await loadContextFile();

  // If context file already has context name similar to the one specified as
  // an argument, notify user about it (throw `ContextAlreadyExistsError`
  // error) and exit.
  if (fileContent.store.hasOwnProperty.call(fileContent.store, contextName)) {
    throw new ContextAlreadyExistsError(contextName, CONTEXT_FILE_PATH);
  }

  fileContent.store[String(contextName)] = String(pathToFile);
  await saveContextFile(fileContent);
}

export async function removeContext(contextName: string) {
  const fileContent: IContextFile = await loadContextFile();

  if (await isContextFileEmpty(fileContent)) {
    throw new ContextFileEmptyError(CONTEXT_FILE_PATH);
  }
  if (!fileContent.store[String(contextName)]) {
    throw new ContextNotFoundError(contextName);
  }
  if (fileContent.current === contextName) {
    delete fileContent.current;
  }

  delete fileContent.store[String(contextName)];
  await saveContextFile(fileContent);
}

export async function getCurrentContext(): Promise<ICurrentContext> {
  const fileContent: IContextFile = await loadContextFile();

  if (await isContextFileEmpty(fileContent)) {
    throw new ContextFileEmptyError(CONTEXT_FILE_PATH);
  }

  const context = await loadContext();

  return {
    current: fileContent.current as string,
    context,
  };
}

export async function setCurrentContext(contextName: string) {
  const fileContent: IContextFile = await loadContextFile();

  if (await isContextFileEmpty(fileContent)) {
    throw new ContextFileEmptyError(CONTEXT_FILE_PATH);
  }

  if (!fileContent.store[String(contextName)]) {
    throw new ContextNotFoundError(contextName);
  }

  fileContent.current = String(contextName);
  await saveContextFile(fileContent);
}

export async function editContext(contextName: string, pathToFile: string) {
  // The expression is not wrapped in a `try...catch` block and is allowed to
  // throw automatically because it is assumed that `loadContextFile()` works
  // with a 100%-existing valid file in this case, thus if it threw anyway -
  // some REAL error happened and user should know about it.
  const fileContent: IContextFile = await loadContextFile();

  if (await isContextFileEmpty(fileContent)) {
    throw new ContextFileEmptyError(CONTEXT_FILE_PATH);
  }

  fileContent.store[String(contextName)] = String(pathToFile);
  await saveContextFile(fileContent);
}

export async function loadContextFile(): Promise<IContextFile> {
  let fileContent: IContextFile;

  // If the context file cannot be read then it's a 'MissingContextFileError'
  // error.
  try {
    await readFile(CONTEXT_FILE_PATH, { encoding: 'utf8' });
  } catch (e) {
    throw new MissingContextFileError();
  }

  // If the context file cannot be parsed then it's a
  // 'ContextFileWrongFormatError' error.
  try {
    fileContent = JSON.parse(
      await readFile(CONTEXT_FILE_PATH, { encoding: 'utf8' })
    );
  } catch (e) {
    // https://stackoverflow.com/questions/29797946/handling-bad-json-parse-in-node-safely
    throw new ContextFileWrongFormatError(CONTEXT_FILE_PATH);
  }

  // If the context file cannot be validated then it's a
  // 'ContextFileWrongFormatError' error.
  if (!(await isContextFileValid(fileContent))) {
    throw new ContextFileWrongFormatError(CONTEXT_FILE_PATH);
  }

  return fileContent;
}

async function saveContextFile(fileContent: IContextFile) {
  try {
    await writeFile(
      CONTEXT_FILE_PATH,
      JSON.stringify({
        current: fileContent.current,
        store: fileContent.store,
      }),
      { encoding: 'utf8' }
    );
  } catch (e) {
    throw new ContextFileWriteError(CONTEXT_FILE_PATH);
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
    // uninterrupted execution of the loop.
    try {
      // If a file is found which can be read and passed validation as a
      // legitimate context file, then it is considered a legitimate context
      // file indeed.
      const fileContent = JSON.parse(
        await readFile(currentPathString, {
          encoding: 'utf8',
        })
      );
      if (
        fileContent &&
        (await isContextFileValid(fileContent as unknown as IContextFile))
      ) {
        CONTEXT_FILE_PATH = currentPathString;
        return CONTEXT_FILE_PATH;
      }
    } catch (e) {} // eslint-disable-line

    currentPath.pop();
  }
  return null;
}

async function isContextFileValid(fileContent: IContextFile): Promise<boolean> {
  // Validation of context file's format against interface `IContextFile`.
  return (
    [1, 2].includes(Object.keys(fileContent).length) &&
    fileContent.hasOwnProperty.call(fileContent, 'store') &&
    !Array.from(Object.keys(fileContent.store)).find(
      (elem) => typeof elem !== 'string'
    ) &&
    !Array.from(Object.values(fileContent.store)).find(
      (elem) => typeof elem !== 'string'
    )
  );
}

export async function isContextFileEmpty(
  fileContent: IContextFile
): Promise<boolean> {
  // If context file contains only one empty property `store` then the whole
  // context file is considered empty.
  return (
    fileContent &&
    Object.keys(fileContent).length === 1 &&
    Object.keys(fileContent.store).length === 0
  );
}
