import { existsSync, promises as fPromises } from 'fs';
import { SpecificationFileNotFound } from '@errors/specification-file';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import open from 'open';
import path from 'path';
import { blueBright, redBright } from 'picocolors';

const { readFile, writeFile } = fPromises;

const sockets: any[] = [];
const messageQueue: string[] = [];

export const DEFAULT_PORT = 0;

function isValidFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

type NextFactory = (config?: any) => any;

// @asyncapi/studio is an optional, on-demand dependency (installed on first use
// into the CLI data directory, see studio-installer.ts). Resolving it lazily
// means commands which only reference this module (like `new file` without
// `--studio`) keep working even when Studio is not installed.
function resolveStudioPath(): string {
  try {
    return path.dirname(require.resolve('@asyncapi/studio/package.json'));
  } catch {
    throw new Error(
      'Studio is not available in this installation. Run the command in an interactive terminal to install it on-demand, or pass "--yes" to install automatically.',
    );
  }
}

function getStudioVersion(studioPath?: string): string {
  try {
    const pkgPath = studioPath
      ? path.join(studioPath, 'package.json')
      : require.resolve('@asyncapi/studio/package.json');
    return require(pkgPath).version;
  } catch {
    return 'unknown';
  }
}

// Using require here is necessary for dynamic module resolution
function resolveStudioNextInstance(studioPath: string): NextFactory {
  const resolvedNextPath = require.resolve('next', { paths: [studioPath] });
  const nextModule = require(resolvedNextPath);
  return nextModule.default ?? nextModule;
}
 
export function start(filePath: string, port: number = DEFAULT_PORT, noBrowser?:boolean, studioPath?: string): void {
  if (filePath && !isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }

  // Locate @asyncapi/studio package (resolved on-demand by the command, or
  // fall back to node_modules resolution for bundled installs).
  const resolvedStudioPath = studioPath ?? resolveStudioPath();
  const nextInstance = resolveStudioNextInstance(resolvedStudioPath);
  const app = nextInstance({
    dev: false,
    dir: resolvedStudioPath,
    conf: {
      distDir: 'build',
    } as any,
  });

  const handle = app.getRequestHandler();

  const wsServer = new WebSocketServer({ noServer: true });

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

  app.prepare().then(() => {
    if (filePath) {
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

    const server = createServer((req, res) => {
      if (req.url === '/close') {
        for (const socket of wsServer.clients) {
          socket.close();
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server is shutting down' }));
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
      const url = `http://localhost:${listenPort}?liveServer=${listenPort}&studio-version=${getStudioVersion(resolvedStudioPath)}`;
      console.log(`🎉 Connected to Live Server running at ${blueBright(url)}.`);
      console.log(`🌐 Open this URL in your web browser: ${blueBright(url)}`);
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
      if (!noBrowser) {
        open(url);
      }
    }).on('error', (error) => {
      if (error.message.includes('EADDRINUSE')) {
        console.log(error);
        console.error(redBright(`Error: Port ${port} is already in use.`));
        // eslint-disable-next-line no-process-exit
        process.exit(2);
      } else {
        console.error(`Failed to start server on port ${port}`);
      }
    });
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
