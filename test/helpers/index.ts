import { existsSync, writeFileSync, unlinkSync,rmdirSync, mkdirSync, promises as fs } from 'fs';
import * as path from 'path';
import { IContextFile, CONTEXT_FILE_PATH } from '../../src/domains/models/Context';
import SpecificationFile from '../../src/domains/models/SpecificationFile';
import http from 'http';
import { rimrafSync } from 'rimraf';
import puppeteer from 'puppeteer';
import { version as studioVersion } from '@asyncapi/studio/package.json';

const ASYNCAPI_FILE_PATH = path.resolve(process.cwd(), 'specification.yaml');
const SERVER_DIRECTORY= path.join(__dirname, '../fixtures/dummyspec');
export const PROJECT_DIRECTORY_PATH = path.join(process.cwd(), 'test-project');

let server: http.Server;

export default class ContextTestingHelper {
  private _context: IContextFile;
  constructor() {
    const homeSpecFile = new SpecificationFile(path.resolve(__dirname, '../fixtures/specification.yml'));

    const codeSpecFile = new SpecificationFile(path.resolve(__dirname, '../fixtures/specification.yml'));
    this._context = {
      current: 'home',
      store: {
        home: homeSpecFile.getPath(),
        code: codeSpecFile.getPath()
      }
    };
  }

  get context(): IContextFile {
    return this._context;
  }

  createDummyContextFile(): void {
    writeFileSync(CONTEXT_FILE_PATH, JSON.stringify(this._context), { encoding: 'utf8' });
  }

  createDummyContextFileWrong(data: string): void {
    writeFileSync(CONTEXT_FILE_PATH, JSON.stringify(data));
  }

  deleteDummyContextFile(): void {
    if (existsSync(CONTEXT_FILE_PATH)) {
      unlinkSync(CONTEXT_FILE_PATH);
    }
  }

  unsetCurrentContext(): void {
    delete this._context.current;
  }

  setCurrentContext(context: string): void {
    this._context.current = context;
  }

  getPath(key: string): string | undefined {
    return this._context.store[String(key)];
  }

  createSpecFileAtWorkingDir(): void {
    writeFileSync(ASYNCAPI_FILE_PATH, '');
  }

  deleteSpecFileAtWorkingDir(): void {
    unlinkSync(ASYNCAPI_FILE_PATH);
  }

  createDummyProjectDirectory(): void {
    mkdirSync(PROJECT_DIRECTORY_PATH);
  }

  deleteDummyProjectDirectory(): void {
    rimrafSync(PROJECT_DIRECTORY_PATH);
  }
}

export function fileCleanup(filepath: string) {
  unlinkSync(filepath);
}

export async function waitForServer(port: number, timeoutMs = 60000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}`, {
        redirect: 'manual',
      });
      if (response.status < 500) {
        return;
      }
    } catch (error: unknown) {
      const cause = (error as { cause?: { code?: string } })?.cause;
      if (cause?.code !== 'ECONNREFUSED') {
        throw error;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Server on port ${port} did not start within ${timeoutMs}ms`);
}

export async function isChromeAvailable(): Promise<boolean> {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true,
    });
    await browser.close();
    return true;
  } catch {
    return false;
  }
}

export async function testStudio(port = 3210){
  await waitForServer(port);
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  await page.goto(`http://127.0.0.1:${port}?liveServer=${port}&studio-version=${studioVersion}`);
  await page.setViewport({width: 1080, height: 1024});

  const logo = await page.locator('body > div:nth-child(1) > div > div > div > div > img').waitHandle()

  const logoTitle = await logo?.evaluate((e:any) => e.title)
  await browser.close();
  return {logoTitle}
}

export async function testPreview(port = 4321){
  await waitForServer(port);
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  await page.goto(`http://127.0.0.1:${port}?previewServer=${port}&studio-version=${studioVersion}`);
  await page.setViewport({width: 1080, height: 1024});

  const logo = await page.locator('body > div:nth-child(1) > div > div > div > div > img').waitHandle()
  const introductionSection = await page.locator('#introduction').waitHandle()

  const logoTitle = await logo?.evaluate((e:any) => e.title)
  const introductionSectionId = await introductionSection?.evaluate((e:any)=> e.id)

  await browser.close();
  return {logoTitle,introductionSectionId}
}
export function createMockServer (port = 8080) {
  server = http.createServer(async (req,res) => {
    if (req.method ==='GET') {
      const filePath= path.join(SERVER_DIRECTORY, req.url || '/');
      try {
        const content = await fs.readFile(filePath, {encoding: 'utf8'});
        res.writeHead(200, {'Content-Type': getContentType(filePath)});
        res.end(content);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          res.writeHead(404);
          res.end('404 NOT FOUND');
        } else {
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      }
    }
  });
  server.listen(port);
}

export function stopMockServer() {
  server.close();
}

function isConnectionRefused(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const err = error as { code?: string; cause?: unknown; errors?: unknown[] };
  if (err.code === 'ECONNREFUSED') {
    return true;
  }
  if (err.cause) {
    return isConnectionRefused(err.cause);
  }
  if (Array.isArray(err.errors)) {
    return err.errors.some(isConnectionRefused);
  }

  return false;
}

export async function closeStudioServer(port = 3210): Promise<void> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/close`);
    if (response.ok) {
      await response.text();
    } else {
      console.log(`Failed to close server. Status: ${response.status}`);
    }
  } catch (error: unknown) {
    if (isConnectionRefused(error)) {
      return;
    }
    console.error('Error closing studio server:', error);
  }
}

function getContentType(filePath:string):string {
  const extname = path.extname(filePath);
  switch (extname) {
  case '.json':
    return 'application/json';
  case '.yml':
  case '.yaml':
    return 'application/yaml';
  default:
    // Any other suggestion?
    return 'application/octet-stream';
  }
}
