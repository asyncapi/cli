import { promises as fs } from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

import { loadContext } from './Context';
import { SpecificationFileNotFound, SpecificationURLNotFound } from '../errors/specification-file';

const { readFile, lstat } = fs;
const allowedFileNames: string[] = [
  'asyncapi.json',
  'asyncapi.yml',
  'asyncapi.yaml'
];
const TYPE_CONTEXT_NAME = 'context-name';
const TYPE_FILE_PATH = 'file-path';
const TYPE_URL = 'url-path';

export class Specification {
  private readonly spec: string;
  private readonly filePath?: string;
  private readonly fileURL?: string;
  constructor(spec: string, options?: { filepath?: string, fileURL?: string }) {
    this.spec = spec;
    this.filePath = options?.filepath;
    this.fileURL = options?.fileURL;
  }

  text() {
    return this.spec;
  }

  getFilePath() {
    return this.filePath;
  }

  getFileURL() {
    return this.fileURL;
  }

  static async fromFile(filepath: string) {
    return new Specification(await readFile(filepath, { encoding: 'utf8' }), { filepath });
  }

  static async fromURL(URLpath: string) {
    let response;
    try {
      response = await fetch(URLpath, { method: 'GET' });
    } catch (error) {
      throw new SpecificationURLNotFound(URLpath);
    }
    return new Specification(await response?.text() as string, { fileURL: URLpath });
  }
}

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

export async function load(filePathOrContextName?: string): Promise<Specification> {
  if (filePathOrContextName) {
    const type = await nameType(filePathOrContextName);
    if (type === TYPE_CONTEXT_NAME) {
      return loadFromContext(filePathOrContextName);
    }

    if (type === TYPE_URL) {
      return Specification.fromURL(filePathOrContextName);
    }
    await fileExists(filePathOrContextName);
    return Specification.fromFile(filePathOrContextName);
  }

  try {
    return await loadFromContext();
  } catch (e) {
    const autoDetectedSpecFile = await detectSpecFile();
    if (autoDetectedSpecFile) {
      return Specification.fromFile(autoDetectedSpecFile);
    }
    if (!filePathOrContextName || !autoDetectedSpecFile) {
      throw e;
    }
  }

  throw new SpecificationFileNotFound();
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
    if (await isURL(name)) {return TYPE_URL;}
    return TYPE_CONTEXT_NAME;
  }
}

export async function isURL(urlpath: string): Promise<boolean> {
  try {
    const url = new URL(urlpath);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
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

async function loadFromContext(contextName?: string): Promise<Specification> {
  const context = await loadContext(contextName);
  return Specification.fromFile(context);
}

async function detectSpecFile(): Promise<string | undefined> {
  const existingFileNames = await Promise.all(allowedFileNames.map(async filename => {
    try {
      const exists = await fileExists(path.resolve(process.cwd(), filename));
      return exists ? filename : undefined;
    } catch (e) {
      // We did our best...
    }
  }));
  return existingFileNames.find(filename => filename !== undefined);
}

