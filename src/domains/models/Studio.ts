import { existsSync, promises as fPromises } from 'fs';
import { copySync } from 'fs-extra';
import { SpecificationFileNotFound } from '@errors/specification-file';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import chokidar from 'chokidar';
import open from 'open';
import path from 'path';
import { fork, ChildProcess } from 'child_process';
import { version as studioVersion } from '@asyncapi/studio/package.json';
import { blueBright, redBright } from 'picocolors';

const { readFile, writeFile } = fPromises;

const sockets: any[] = [];
const messageQueue: string[] = [];

export const DEFAULT_PORT = 0;

function isValidFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

type NextFactory = (config?: any) => any;

// Using require here is necessary for dynamic module resolution
function resolveStudioNextInstance(studioPath: string): NextFactory {
  const resolvedNextPath = require.resolve('next', { paths: [studioPath] });
  const nextModule = require(resolvedNextPath);
  return nextModule.default ?? nextModule;
}

export async function start(filePath: string, port: number = DEFAULT_PORT, noBrowser?: boolean): Promise<void> {
  if (filePath && !isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }

  const studioPath = path.dirname(
    require.resolve('@asyncapi/studio/package.json'),
  );

  const standalonePath = path.join(studioPath, 'build', 'standalone', 'apps', 'studio', 'server.js');

  if (existsSync(standalonePath)) {
    await startStandalone(filePath, port, noBrowser, standalonePath, studioPath);
  } else {
    await startLegacy(filePath, port, noBrowser, studioPath);
  }
}

async function startStandalone(filePath: string, port: number, noBrowser: boolean | undefined, serverPath: string, studioPath: string) {
  // Ensure static assets are available in the standalone directory
  const standaloneDir = path.dirname(serverPath);
  const staticSrc = path.join(studioPath, 'build', 'static');
  const staticDest = path.join(standaloneDir, 'build', 'static');
  const publicSrc = path.join(studioPath, 'public');
  const publicDest = path.join(standaloneDir, 'public');

  try {
    if (!existsSync(staticDest) && existsSync(staticSrc)) {
      copySync(staticSrc, staticDest);
    }
    if (!existsSync(publicDest) && existsSync(publicSrc)) {
      copySync(publicSrc, publicDest);
    }
  } catch (error) {
    console.warn('Warning: Failed to copy static assets to standalone directory. Studio might not load correctly.', error);
  }

  let studioPort = port;
  if (studioPort === 0) {
    studioPort = await getFreePort();
  }

  const wsServer = new WebSocketServer({ port: 0 });

  await new Promise<void>((resolve) => {
    wsServer.on('listening', resolve);
  });

  const wsPort = (wsServer.address() as any).port;

  setupWebSocketHandlers(wsServer, filePath);
  if (filePath) {
    setupFileWatcher(filePath);
  }

  const child = fork(serverPath, [], {
    env: { ...process.env, PORT: studioPort.toString() },
    stdio: 'ignore',
    cwd: standaloneDir,
  });

  const url = `http://localhost:${studioPort}?liveServer=${wsPort}&studio-version=${studioVersion}`;
  logStartupMessage(url, filePath, studioPort, noBrowser);

  if (!noBrowser) {
    open(url);
  }

  const cleanup = () => {
    child.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', () => child.kill());
}

async function startLegacy(filePath: string, port: number, noBrowser: boolean | undefined, studioPath: string) {
  const nextInstance = resolveStudioNextInstance(studioPath);
  const app = nextInstance({
    dev: false,
    dir: studioPath,
    conf: {
      distDir: 'build',
    } as any,
  });

  const handle = app.getRequestHandler();
  // Legacy logic attaches WS to HTTP server
  const wsServer = new WebSocketServer({ noServer: true });

  // Handlers
  setupWebSocketHandlers(wsServer, filePath);

  await app.prepare();

  if (filePath) {
    setupFileWatcher(filePath);
  }

  const server = createServer((req, res) => {
    if (req.url === '/close') {
      for (const socket of wsServer.clients) {
        socket.close();
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Server is shutting down' }));
      server.close(() => {
        process.exit(0);
      });
      return;
    }
    handle(req, res);
  });

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/live-server') {
      console.log('🔗 WebSocket connection established.');
      wsServer.handleUpgrade(request, socket, head, (sock: any) => {
        wsServer.emit('connection', sock, request);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    const addr = server.address();
    const listenPort = (addr && typeof addr === 'object' && 'port' in addr) ? (addr as any).port : port;
    const url = `http://localhost:${listenPort}?liveServer=${listenPort}&studio-version=${studioVersion}`;
    logStartupMessage(url, filePath, listenPort, noBrowser);

    if (!noBrowser) {
      open(url);
    }
  }).on('error', (error: any) => {
    if (error.message.includes('EADDRINUSE')) {
      console.log(error);
      console.error(redBright(`Error: Port ${port} is already in use.`));
      process.exit(2);
    } else {
      console.error(`Failed to start server on port ${port}`);
    }
  });
}

function setupWebSocketHandlers(wsServer: WebSocketServer, filePath: string) {
  wsServer.on('connection', (socket: any) => {
    sockets.push(socket);
    if (filePath) {
      getFileContent(filePath).then((code: string) => {
        messageQueue.push(
          JSON.stringify({
            type: 'file:loaded',
            code,
          }),
        );
        sendQueuedMessages();
      });
    } else {
      messageQueue.push(
        JSON.stringify({
          type: 'file:loaded',
          code: '',
        }),
      );
      sendQueuedMessages();
    }

    socket.on('message', (event: string) => {
      try {
        const json: any = JSON.parse(event);
        if (filePath && json.type === 'file:update') {
          saveFileContent(filePath, json.code);
        } else {
          console.warn(
            'Live Server: An unknown event has been received. See details:',
          );
          console.log(json);
        }
      } catch {
        console.error(
          `Live Server: An invalid event has been received. See details:\n${event}`,
        );
      }
    });
  });

  wsServer.on('close', (socket: any) => {
    sockets.splice(sockets.findIndex((s) => s === socket));
  });
}

function setupFileWatcher(filePath: string) {
  chokidar.watch(filePath).on('all', (event, path) => {
    switch (event) {
      case 'add':
      case 'change':
        getFileContent(path).then((code: string) => {
          messageQueue.push(
            JSON.stringify({
              type: 'file:changed',
              code,
            }),
          );
          sendQueuedMessages();
        });
        break;
      case 'unlink':
        messageQueue.push(
          JSON.stringify({
            type: 'file:deleted',
            filePath,
          }),
        );
        sendQueuedMessages();
        break;
    }
  });
}

function logStartupMessage(url: string, filePath: string, port: number, noBrowser: boolean | undefined) {
  if (noBrowser) {
    console.log(`🔗 Studio is running at ${blueBright(url)}`);
  } else {
    console.log(`🎉 Connected to Live Server running at ${blueBright(url)}.`);
    console.log(`🌐 Open this URL in your web browser: ${blueBright(url)}`);
  }

  console.log(
    `🛑 If needed, press ${redBright('Ctrl + C')} to stop the process.`,
  );

  if (filePath) {
    console.log(`👁️ Watching changes on file ${blueBright(filePath)}`);
  } else {
    console.warn(
      'Warning: No file was provided, and we couldn\'t find a default file (like "asyncapi.yaml" or "asyncapi.json") in the current folder. Starting Studio with a blank workspace.',
    );
  }
}

function sendQueuedMessages() {
  while (messageQueue.length && sockets.length) {
    const nextMessage = messageQueue.shift();
    for (const socket of sockets) {
      socket.send(nextMessage);
    }
  }
}

function getFileContent(filePath: string): Promise<string> {
  return new Promise((resolve) => {
    readFile(filePath, { encoding: 'utf8' })
      .then((code: string) => {
        resolve(code);
      })
      .catch(console.error);
  });
}

function saveFileContent(filePath: string, fileContent: string): void {
  writeFile(filePath, fileContent, { encoding: 'utf8' }).catch(console.error);
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, () => {
      const port = (server.address() as any).port;
      server.close(() => resolve(port));
    });
  });
}
