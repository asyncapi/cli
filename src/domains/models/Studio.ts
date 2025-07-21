import { existsSync, promises as fPromises } from 'fs';
import { SpecificationFileNotFound } from '@errors/specification-file';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import open from 'open';
import next from 'next';
import path from 'path';
import { version as studioVersion } from '@asyncapi/studio/package.json';
import { blueBright, redBright } from 'picocolors';

const { readFile, writeFile } = fPromises;

const sockets: any[] = [];
const messageQueue: string[] = [];

export const DEFAULT_PORT = 3210;

function isValidFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

export function start(filePath: string, port: number = DEFAULT_PORT): void {
  if (filePath && !isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }

  // Locate @asyncapi/studio package
  const studioPath = path.dirname(require.resolve('@asyncapi/studio/package.json'));
  const app = next({
    dev: false,
    dir: studioPath,
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
        messageQueue.push(JSON.stringify({
          type: 'file:loaded',
          code,
        }));
        sendQueuedMessages();
      });
    } else {
      messageQueue.push(JSON.stringify({
        type: 'file:loaded',
        code: '',
      }));
      sendQueuedMessages();
    }

    socket.on('message', (event: string) => {
      try {
        const json: any = JSON.parse(event);
        if (filePath && json.type === 'file:update') {
          saveFileContent(filePath, json.code);
        } else {
          console.warn('Live Server: An unknown event has been received. See details:');
          console.log(json);
        }
      } catch (e) {
        console.error(`Live Server: An invalid event has been received. See details:\n${event}`);
      }
    });
  });

  wsServer.on('close', (socket: any) => {
    sockets.splice(sockets.findIndex(s => s === socket));
  });

  app.prepare().then(() => {
    if (filePath) {
      chokidar.watch(filePath).on('all', (event, path) => {
        switch (event) {
        case 'add':
        case 'change':
          getFileContent(path).then((code: string) => {
            messageQueue.push(JSON.stringify({
              type: 'file:changed',
              code,
            }));
            sendQueuedMessages();
          });
          break;
        case 'unlink':
          messageQueue.push(JSON.stringify({
            type: 'file:deleted',
            filePath,
          }));
          sendQueuedMessages();
          break;
        }
      });
    }

    const server = createServer((req, res) => handle(req, res));

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
      const url = `http://localhost:${port}?liveServer=${port}&studio-version=${studioVersion}`;
      console.log(`🎉 Connected to Live Server running at ${blueBright(url)}.`);
      console.log(`🌐 Open this URL in your web browser: ${blueBright(url)}`);
      console.log(`🛑 If needed, press ${redBright('Ctrl + C')} to stop the process.`);
      if (filePath) {
        console.log(`👁️ Watching changes on file ${blueBright(filePath)}`);
      } else {
        console.warn(
          'Warning: No file was provided, and we couldn\'t find a default file (like "asyncapi.yaml" or "asyncapi.json") in the current folder. Starting Studio with a blank workspace.'
        );
      }
      open(url);
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
  writeFile(filePath, fileContent, { encoding: 'utf8' })
    .catch(console.error);
}
