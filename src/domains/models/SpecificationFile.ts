import { promises as fs } from 'fs';
import path from 'path';
import { URL } from 'url';
import yaml from 'js-yaml';
import { loadContext } from './Context';
import { ErrorLoadingSpec } from '@errors/specification-file';
import { MissingContextFileError } from '@errors/context-error';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES, type CliErrorCode } from '@errors/error-codes';
import { fileFormat } from '@cli/internal/flags/format.flags';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { logger } from '@utils/logger';
import { getErrorMessage } from '@utils/error-handler';
import {
  getSpecFileExtension,
  isAllowedSpecExtension,
} from '@utils/spec-file';
const { readFile, lstat } = fs;
const allowedFileNames: string[] = [
  'asyncapi.json',
  'asyncapi.yml',
  'asyncapi.yaml',
];
const TYPE_CONTEXT_NAME = 'context-name';
const TYPE_FILE_PATH = 'file-path';
const TYPE_URL = 'url-path';

export class Specification {
  private readonly spec: string;
  private readonly filePath?: string;
  private readonly fileURL?: string;
  private readonly kind?: 'file' | 'url';

  constructor(
    spec: string,
    options: { filepath?: string; fileURL?: string } = {},
  ) {
    this.spec = spec;
    if (options.filepath) {
      this.filePath = options.filepath;
      this.kind = 'file';
    } else if (options.fileURL) {
      this.fileURL = options.fileURL;
      this.kind = 'url';
    }
  }

  isAsyncAPI3() {
    const jsObj = this.toJson();
    return jsObj.asyncapi.startsWith('3.');
  }

  toJson(): Record<string, any> {
    try {
      return yaml.load(this.spec, { json: true }) as Record<string, any>;
    } catch {
      return JSON.parse(this.spec);
    }
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

  getKind() {
    return this.kind;
  }

  getSource() {
    return this.getFilePath() ?? this.getFileURL();
  }

  toSourceString() {
    if (this.kind === 'file') {
      return `File ${this.filePath}`;
    }
    return `URL ${this.fileURL}`;
  }

  static async fromFile(filepath: string) {
    let spec;
    try {
      spec = await readFile(filepath, { encoding: 'utf8' });
    } catch (error: unknown) {
      throw fileReadError(filepath, error);
    }
    return new Specification(spec, { filepath });
  }

  static async fromURL(URLpath: string) {
    let response: Response;
    const delimiter = '+';
    let targetUrl = URLpath;
    let proxyUrl = '';

    // Check if URLpath contains a proxy URL
    if (URLpath.includes(delimiter)) {
      [targetUrl, proxyUrl] = URLpath.split(delimiter);
    }

    try {
      // Validate the target URL
      try {
        new URL(targetUrl);
      } catch (err: unknown) {
        throw urlLoadError(CLI_ERROR_CODES.URL_FETCH_FAILED, targetUrl, err);
      }

      const fetchOptions: RequestInit & { agent?: HttpsProxyAgent<string> } = { method: 'GET' };

      // If proxy URL is provided, create a proxy agent
      if (proxyUrl) {
        try {
          new URL(proxyUrl);
          const proxyAgent = new HttpsProxyAgent(proxyUrl);
          fetchOptions.agent = proxyAgent;
          response = await fetch(targetUrl, fetchOptions);
        } catch (err: unknown) {
          logger.error(`Proxy connection error: ${getErrorMessage(err)}`);
          throw urlLoadError(
            CLI_ERROR_CODES.PROXY_ERROR,
            targetUrl,
            new Error(
              'Proxy Connection Error: Unable to establish a connection to the proxy check hostName or PortNumber',
              { cause: err },
            ),
            { url: targetUrl, proxy: proxyUrl },
          );
        }
      } else {
        response = await fetch(targetUrl);
      }

      if (!response.ok) {
        throw urlLoadError(CLI_ERROR_CODES.HTTP_RESPONSE_ERROR, targetUrl, undefined, {
          url: targetUrl,
          status: response.status,
          statusText: response.statusText,
        });
      }
    } catch (error: unknown) {
      logger.error(`Error loading spec from URL: ${getErrorMessage(error)}`);
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw urlLoadError(classifyFetchError(error), targetUrl, error);
    }

    return new Specification(await response.text(), {
      fileURL: targetUrl,
    });
  }
}

const URL_LOAD_ERROR_NAME = new ErrorLoadingSpec('url').name;
const FILE_LOAD_ERROR_NAME = new ErrorLoadingSpec('file').name;

const TIMEOUT_ERROR_CODES = new Set([
  'ETIMEDOUT',
  'ESOCKETTIMEDOUT',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
]);
const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EPIPE',
  'UND_ERR_SOCKET',
]);

/**
 * Builds a URL loading error that keeps the historical `ErrorLoadingSpec`
 * name and message (so human output is unchanged) while carrying a precise
 * CLI error code and the original cause.
 */
function urlLoadError(
  code: CliErrorCode,
  targetUrl: string,
  cause?: unknown,
  details?: unknown,
): ApplicationError {
  return Object.assign(
    new ApplicationError(code, new ErrorLoadingSpec('url', targetUrl).message, {
      cause,
      details: details ?? { url: targetUrl },
    }),
    { name: URL_LOAD_ERROR_NAME },
  );
}

/** Collects `name`/`code` values across an error, its cause chain and aggregated errors. */
function collectErrorSignals(error: unknown, seen = new Set<unknown>()): { names: string[]; codes: string[] } {
  const signals = { names: [] as string[], codes: [] as string[] };
  if (!error || typeof error !== 'object' || seen.has(error)) {
    return signals;
  }
  seen.add(error);
  const candidate = error as { name?: unknown; code?: unknown; cause?: unknown; errors?: unknown };
  if (typeof candidate.name === 'string') {
    signals.names.push(candidate.name);
  }
  if (typeof candidate.code === 'string') {
    signals.codes.push(candidate.code);
  }
  const nested = [candidate.cause, ...(Array.isArray(candidate.errors) ? candidate.errors : [])];
  for (const inner of nested) {
    const innerSignals = collectErrorSignals(inner, seen);
    signals.names.push(...innerSignals.names);
    signals.codes.push(...innerSignals.codes);
  }
  return signals;
}

export function classifyFetchError(error: unknown): CliErrorCode {
  const { names, codes } = collectErrorSignals(error);
  if (
    names.some((name) => name === 'TimeoutError' || name === 'AbortError') ||
    codes.some((code) => TIMEOUT_ERROR_CODES.has(code))
  ) {
    return CLI_ERROR_CODES.NETWORK_TIMEOUT;
  }
  if (codes.includes('ERR_INVALID_URL')) {
    return CLI_ERROR_CODES.URL_FETCH_FAILED;
  }
  if (
    codes.some((code) => CONNECTION_ERROR_CODES.has(code)) ||
    (error instanceof TypeError && error.message === 'fetch failed')
  ) {
    return CLI_ERROR_CODES.CONNECTION_FAILED;
  }
  return CLI_ERROR_CODES.URL_FETCH_FAILED;
}

/**
 * Maps a file read failure to a CLI error. Missing files keep the historical
 * `ErrorLoadingSpec` error; other failures report what actually went wrong.
 */
function fileReadError(filepath: string, error: unknown): Error {
  const code =
    error && typeof error === 'object' && typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : undefined;
  if (code === 'ENOENT' || code === 'ENOTDIR') {
    return new ErrorLoadingSpec('file', filepath);
  }
  let cliCode: CliErrorCode = CLI_ERROR_CODES.FILE_READ_FAILED;
  let message = `${filepath} file could not be read: ${getErrorMessage(error)}`;
  if (code === 'EACCES' || code === 'EPERM') {
    cliCode = CLI_ERROR_CODES.FILE_PERMISSION_DENIED;
    message = `${filepath} file could not be read: permission denied.`;
  } else if (code === 'EISDIR') {
    message = `${filepath} is a directory, not a file.`;
  }
  return Object.assign(
    new ApplicationError(cliCode, message, {
      cause: error,
      details: { path: filepath, systemCode: code ?? null },
    }),
    { name: FILE_LOAD_ERROR_NAME },
  );
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

interface LoadType {
  file?: boolean;
  url?: boolean;
  context?: boolean;
}

/* eslint-disable sonarjs/cognitive-complexity */
export async function load(
  filePathOrContextName?: string,
  loadType?: LoadType,
): Promise<Specification> {
  // NOSONAR
  try {
    if (filePathOrContextName) {
      if (loadType?.file) {
        return Specification.fromFile(filePathOrContextName);
      }
      if (loadType?.context) {
        return loadFromContext(filePathOrContextName);
      }
      if (loadType?.url) {
        return Specification.fromURL(filePathOrContextName);
      }

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

    return await loadFromContext();
  } catch (e) {
    const autoDetectedSpecFile = await detectSpecFile();
    if (autoDetectedSpecFile) {
      return Specification.fromFile(autoDetectedSpecFile);
    }

    if (e instanceof MissingContextFileError) {
      throw new ErrorLoadingSpec();
    }

    throw e;
  }
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
  } catch {
    if (await isURL(name)) {
      return TYPE_URL;
    }
    return TYPE_CONTEXT_NAME;
  }
}

export async function isURL(urlpath: string): Promise<boolean> {
  try {
    const url = new URL(urlpath);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function fileExists(name: string): Promise<boolean> {
  try {
    if ((await lstat(name)).isFile()) {
      return true;
    }

    const extension = getSpecFileExtension(name);

    if (!isAllowedSpecExtension(extension)) {
      throw new ErrorLoadingSpec('invalid file', name);
    }

    throw new ErrorLoadingSpec('file', name);
  } catch {
    throw new ErrorLoadingSpec('file', name);
  }
}

async function loadFromContext(contextName?: string): Promise<Specification> {
  try {
    const context = await loadContext(contextName);
    return Specification.fromFile(context);
  } catch (error) {
    if (error instanceof MissingContextFileError) {
      throw new ErrorLoadingSpec();
    }
    throw error;
  }
}

async function detectSpecFile(): Promise<string | undefined> {
  const existingFileNames = await Promise.all(
    allowedFileNames.map(async (filename) => {
      try {
        const exists = await fileExists(path.resolve(process.cwd(), filename));
        return exists ? filename : undefined;
      } catch {
        // We did our best...
      }
    }),
  );
  return existingFileNames.find((filename) => filename !== undefined);
}

export function retrieveFileFormat(content: string): fileFormat | undefined {
  try {
    if (content.trimStart()[0] === '{') {
      JSON.parse(content);
      return 'json';
    }
    // below yaml.load is not a definitive way to determine if a file is yaml or not.
    // it is able to load .txt text files also.
    yaml.load(content);
    return 'yaml';
  } catch {
    return undefined;
  }
}

/**
 * Converts a JSON or YAML specification to YAML format.
 * 
 * @param spec - The specification content as a string
 * @returns The YAML formatted string, or undefined if conversion fails
 */
export function convertToYaml(spec: string): string | undefined {
  try {
    // JS object -> YAML string
    const jsonContent = yaml.load(spec);
    return yaml.dump(jsonContent);
  } catch (err: unknown) {
    logger.error(`Failed to convert spec to YAML: ${getErrorMessage(err)}`);
    return undefined;
  }
}

/**
 * Converts a JSON or YAML specification to JSON format.
 * 
 * @param spec - The specification content as a string
 * @returns The JSON formatted string, or undefined if conversion fails
 */
export function convertToJSON(spec: string): string | undefined {
  try {
    // JSON or YAML String -> JS object
    const jsonContent = yaml.load(spec);
    // JS Object -> pretty JSON string
    return JSON.stringify(jsonContent, null, 2);
  } catch (err: unknown) {
    logger.error(`Failed to convert spec to JSON: ${getErrorMessage(err)}`);
    return undefined;
  }
}
