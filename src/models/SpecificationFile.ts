import { promises as fs } from 'fs';
import * as path from 'path';

import { loadContext } from './Context';
import { ValidationError } from '../errors/validation-error';
import { SpecificationFileNotFound } from '../errors/specification-file';

const { readFile, lstat } = fs;
const allowedFileNames: string[] = [
  'asyncapi.json',
  'asyncapi.yml',
  'asyncapi.yaml'
];
const TYPE_CONTEXT_NAME = 'context-name';
const TYPE_FILE_PATH = 'file-path';

export default class SpecificationFile {
  private readonly pathToFile: string;

  constructor(filePath: string) {
    this.pathToFile = filePath;
  }
  
  getPath(): string {
    return this.pathToFile;
  }

  async read(): Promise<string> {
    return readFile(this.pathToFile, { encoding: 'utf8' });
  }
}

export async function load(filePathOrContextName?: string): Promise<SpecificationFile> {
  if (filePathOrContextName) {
    const type = await nameType(filePathOrContextName);
    if (type === TYPE_CONTEXT_NAME) {
      return loadFromContext(filePathOrContextName);
    } 
    await fileExists(filePathOrContextName);
    return new SpecificationFile(filePathOrContextName);
  }

  try {
    return loadFromContext();
  } catch (e) {
    // We did our best...
  }
  
  const autoDetectedSpecFile = await detectSpecFile();
  if (autoDetectedSpecFile) {
    return new SpecificationFile(autoDetectedSpecFile);
  }

  throw new ValidationError({ type: 'no-spec-found' });
}

export async function nameType(name: string): Promise<string> {
  if (name.startsWith('.')) {
    return TYPE_FILE_PATH;
  }

  try {
    if (await fileExists(name)) {
      return TYPE_FILE_PATH;
    }
    return TYPE_CONTEXT_NAME;
  } catch (e) {
    return TYPE_CONTEXT_NAME;
  }
}

export async function fileExists(name: string): Promise<boolean> {
  try {
    if ((await lstat(name)).isFile()) {
      return true;
    }
    throw new SpecificationFileNotFound(name);
  } catch (e) {
    throw new SpecificationFileNotFound(name);
  }
}

async function loadFromContext(contextName?: string): Promise<SpecificationFile> {
  const context = await loadContext(contextName);
  return new SpecificationFile(context);
}

async function detectSpecFile(): Promise<string | undefined> {
  const existingFileNames = allowedFileNames.map(async filename => {
    return (await fileExists(path.resolve(process.cwd(), filename))) ? filename : undefined;
  });
  return existingFileNames.find(filename => filename !== undefined);
}

