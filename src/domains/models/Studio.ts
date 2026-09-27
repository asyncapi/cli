import { promises as fPromises } from 'fs';
import { SpecificationFileNotFound } from '@errors/specification-file';
import { createServer, Server } from 'http';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import open from 'open';
import { blueBright, redBright } from 'picocolors';
import {
  DEFAULT_PORT,
  getStudioVersion,
  isValidFilePath,
  resolveStudioNextInstance,
  resolveStudioPath,
} from '@models/studio-runtime';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

export { DEFAULT_PORT } from '@models/studio-runtime';

const { readFile, writeFile } = fPromises;

const sockets: any[] = [];
const messageQueue: string[] = [];

export interface StudioStartResult {
  server: Server;
  host: string | null;
  port: number;
  url: string;
}

export async function start(
  filePath: string,
  port: number = DEFAULT_PORT,
  noBrowser?: boolean,
  studioPath?: string,
  quiet = false,
): Promise<StudioStartResult> {
  if (filePath && !isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }

  // Locate @asyncapi/studio package (resolved on-demand by the command, or
  // fall back to node_modules resolution for bundled installs).
  const resolvedStudioPath = studioPath ?? resolveStudioPath('Studio');
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
      }).catch((error) => {
        if (!quiet) {
          console.error(error);
        }
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
          saveFileContent(filePath, json.code, quiet);
        } else if (!quiet) {
          console.warn(
            'Live Server: An unknown event has been received. See details:',
          );
          console.log(json);
        }
      } catch {
        if (!quiet) {
          console.error(
            `Live Server: An invalid event has been received. See details:\n${event}`,
          );
        }
      }
    });
  });

  wsServer.on('close', (socket: any) => {
    sockets.splice(sockets.findIndex((s) => s === socket));
  });

  try {
    await app.prepare();
  } catch (error) {
    throw new ApplicationError(
      CLI_ERROR_CODES.SERVER_START_FAILED,
      `Failed to prepare Studio: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }

  return new Promise((resolve, reject) => {
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
          }).catch((error) => {
            if (!quiet) {
              console.error(error);
            }
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
        if (!quiet) {
          console.log('🔗 WebSocket connection established.');
        }
        wsServer.handleUpgrade(request, socket, head, (sock: any) => {
          wsServer.emit('connection', sock, request);
        });
      } else {
        socket.destroy();
      }
    });

    const onError = (error: NodeJS.ErrnoException) => {
      const code = error.code === 'EADDRINUSE'
        ? CLI_ERROR_CODES.SERVER_PORT_IN_USE
        : CLI_ERROR_CODES.SERVER_START_FAILED;
      const message = error.code === 'EADDRINUSE'
        ? `Port ${port} is already in use.`
        : `Failed to start Studio server on port ${port}: ${error.message}`;

      reject(new ApplicationError(code, message, {
        cause: error,
        details: { port },
      }));
    };

    server.once('error', onError);
    server.listen(port, () => {
      server.removeListener('error', onError);
      const addr = server.address();
      const listenPort = addr && typeof addr === 'object' ? addr.port : port;
      const host = addr && typeof addr === 'object' ? addr.address : null;
      const url = `http://localhost:${listenPort}?liveServer=${listenPort}&studio-version=${getStudioVersion(resolvedStudioPath)}`;
      if (!quiet) {
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
      }
      if (!noBrowser) {
        open(url).catch((error) => {
          if (!quiet) {
            console.error(error);
          }
        });
      }
      resolve({ server, host, port: listenPort, url });
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
  return readFile(filePath, { encoding: 'utf8' });
}

function saveFileContent(filePath: string, fileContent: string, quiet: boolean): void {
  writeFile(filePath, fileContent, { encoding: 'utf8' }).catch((error) => {
    if (!quiet) {
      console.error(error);
    }
  });
}
