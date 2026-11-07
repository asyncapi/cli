import { SpecificationFileNotFound } from '@errors/specification-file';
import { readFileSync } from 'node:fs';
import bundle from '@asyncapi/bundler';
import { createServer, Server } from 'node:http';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import path from 'node:path';
import yaml from 'js-yaml';
import { blueBright, redBright } from 'picocolors';
import {
  DEFAULT_PORT,
  getStudioVersion,
  isValidFilePath,
  listenOnPort,
  openInBrowser,
  resolveStudioNextInstance,
  resolveStudioPath,
} from '@models/studio-runtime';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';
import { getErrorMessage } from '@utils/error-handler';

export { DEFAULT_PORT } from '@models/studio-runtime';

const sockets: any[] = [];
const messageQueue: string[] = [];
const filePathsToWatch: Set<string> = new Set<string>();
const defaultErrorMessage = 'error occured while bundling files. use --detailedLog or -l flag to get more details.';

export interface PreviewOptions {
  base?: string;
  baseDirectory?: string;
  xOrigin?: boolean;
  suppressLogs?: boolean;
  port?: number;
  noBrowser?: boolean;
  quiet?: boolean;
  /** Resolved @asyncapi/studio path (from ensureStudio); falls back to lazy resolution. */
  studioPath?: string;
}

export interface PreviewStartResult {
  server: Server;
  host: string | null;
  port: number;
  url: string;
  watchedFiles: string[];
}

export async function startPreview(
  filePath: string,
  options: PreviewOptions = {},
): Promise<PreviewStartResult> {
  const {
    base,
    baseDirectory,
    xOrigin,
    suppressLogs,
    port = DEFAULT_PORT,
    noBrowser,
    quiet = false,
    studioPath,
  } = options;

  if (filePath && !isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }
  
  const resolvedFilePath = path.resolve(filePath);
  const baseDir = path.dirname(resolvedFilePath);

  const resolvedStudioPath = studioPath ?? resolveStudioPath('Preview');
  const nextInstance = resolveStudioNextInstance(resolvedStudioPath);
  const app = nextInstance({
    dev: false,
    quiet,
    dir: resolvedStudioPath,
    conf: {
      distDir: 'build',
    } as any,
  });

  const handle = app.getRequestHandler();
  
  const wsServer = new WebSocketServer({ noServer: true });

  wsServer.on('connection',(socket:any) => {
    sockets.push(socket);
    sendQueuedMessages();
  });

  wsServer.on('close', (socket: any) => {
    sockets.splice(sockets.findIndex(s => s === socket));
  });

  try {
    await app.prepare();
  } catch (error) {
    throw new ApplicationError(
      CLI_ERROR_CODES.SERVER_START_FAILED,
      `Failed to prepare Preview: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }

  try {
    const doc = await bundle(filePath);
    if (!doc) {
      throw new Error(defaultErrorMessage);
    }
  } catch (error) {
    throw new ApplicationError(
      CLI_ERROR_CODES.PREVIEW_BUNDLE_FAILED,
      suppressLogs
        ? defaultErrorMessage
        : `Failed to bundle preview document: ${getErrorMessage(error)}`,
      { cause: error },
    );
  }

  if (filePath) {
    messageQueue.push(JSON.stringify({
      type: 'preview:connected',
      code: 'Preview server connected'
    }));
    sendQueuedMessages();
    findPathsToWatchFromSchemaRef(filePath, baseDir);
    filePathsToWatch.add(resolvedFilePath);
    chokidar.watch([...filePathsToWatch]).on('all',(event) => {
      switch (event) {
      case 'add':
        bundle([filePath],{
          base,
          baseDir: baseDirectory,
          xOrigin,
        }).then((intitalDocument) => {
          messageQueue.push(JSON.stringify({
            type: 'preview:file:added',
            code: (path.extname(filePath) === '.yaml' || path.extname(filePath) === '.yml') ?
              intitalDocument.yml() : intitalDocument.string()
          }));
          sendQueuedMessages();
        }).catch((e) => {
          if (quiet) {
            return;
          }
          if (suppressLogs) {
            console.log(defaultErrorMessage);
          } else {
            console.log(e);
          }
        });
        break;
      case 'change':
        bundle([filePath],{
          base,
          baseDir: baseDirectory,
          xOrigin,
        }).then((modifiedDocument) => {
          messageQueue.push(JSON.stringify({
            type: 'preview:file:changed',
            code: (path.extname(filePath) === '.yaml' || path.extname(filePath) === '.yml') ?
              modifiedDocument.yml() : modifiedDocument.string()
          }));
          sendQueuedMessages();
        }).catch((error) => {
          if (quiet) {
            return;
          }
          if (suppressLogs) {
            console.log(defaultErrorMessage);
          } else {
            console.log(error);
          }
        });
        break;
      case 'unlink':
        messageQueue.push(JSON.stringify({
          type: 'preview:file:deleted',
          filePath,
        }));
        sendQueuedMessages();
        break;
      }
    });
  }

  return new Promise((resolve, reject) => {
    let listenPort = port;
    const server = createServer((req, res) => {
      if (req.url === '/close') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Shutting down server');
        for (const socket of wsServer.clients) {
          socket.close();
        }
        // Close the server
        server.close(() => {
          // eslint-disable-next-line no-process-exit
          process.exit(0);
        });
        return;
      }
      handle(req, res);
    });

    server.on('upgrade', (request, socket, head) => {
      const origin = request.headers.origin;
      const allowedOrigins = new Set([
        `http://localhost:${listenPort}`,
        `http://127.0.0.1:${listenPort}`,
      ]);

      if (request.url === '/preview-server' && origin && allowedOrigins.has(origin)) {
        if (!quiet) {
          console.log('🔗 WebSocket connection established for the preview.');
        }
        wsServer.handleUpgrade(request, socket, head, (sock: any) => {
          wsServer.emit('connection', sock, request);
        });
      } else {
        if (!quiet) {
          console.log('🔗 WebSocket connection not established.');
        }
        socket.destroy();
      }
    });
    
    listenOnPort(server, port, 'Preview').then(({ host, port: boundPort }) => {
      listenPort = boundPort;
      const url = `http://localhost:${listenPort}?previewServer=${listenPort}&studio-version=${getStudioVersion(resolvedStudioPath)}`;
      if (!quiet) {
        console.log(`🎉 Connected to Preview Server running at ${blueBright(url)}.`);
        console.log(`🌐 Open this URL in your web browser: ${blueBright(url)}`);
        console.log(`🛑 If needed, press ${redBright('Ctrl + C')} to stop the server.`);

        if (filePath) {
          for (const entry of filePathsToWatch) {
            console.log(`👁️ Watching changes on file ${blueBright(entry)}`);
          }
        } else {
          console.warn(
            'Warning: No file was provided, and we couldn\'t find a default file (like "asyncapi.yaml" or "asyncapi.json") in the current folder. Starting Studio with a blank workspace.'
          );
        }
      }
      if (!noBrowser) {
        openInBrowser(url, quiet);
      }
      resolve({
        server,
        host,
        port: listenPort,
        url,
        watchedFiles: [...filePathsToWatch],
      });
    }, reject);
  });
}

function sendQueuedMessages() {
  while (messageQueue.length && sockets.length) {
    const nextMessage = messageQueue.shift();
    for (const socket of sockets) {
      socket.send(nextMessage);
    }
  }
}

function isLocalRefAPath(key: string, value: any): boolean {
  return (typeof value === 'string' && key === '$ref' && 
    (value.startsWith('.') || value.startsWith('./') || 
    value.startsWith('../') || !value.startsWith('#')));
}

function findPathsToWatchFromSchemaRef(filePath: string,baseDir:string) {
  if (filePath && !isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }
  const document = yaml.load(readFileSync(filePath,'utf-8'));
  const stack:object[] = [document as object];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === null || typeof current !== 'object') {
      continue;
    }

    for (const [key,value] of Object.entries(current)) {
      if (isLocalRefAPath(key, value)) {
        const absolutePath = path.resolve(baseDir, value);
        filePathsToWatch.add(absolutePath);
      }

      if (value !== null && typeof value === 'object') {
        stack.push(value);
      }
    }
  }
}
