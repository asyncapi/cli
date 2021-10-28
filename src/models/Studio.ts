import { promises as fPromises } from 'fs';
import { resolve } from 'path';
import { createServer } from 'http';
import serveHandler from 'serve-handler';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import open from 'open';

const { readFile, writeFile } = fPromises;

const sockets: any[] = [];
const messageQueue: string[] = [];

export function start(filePath: string): void {
  chokidar.watch(filePath).on('all', (event, path) => {
    switch (event) {
    case 'add':
    case 'change':
      getFileContent(path).then((code:string) => {
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

  const server = createServer((request, response) => {
    return serveHandler(request, response, {
      public: resolve(__dirname, '../../node_modules/@asyncapi/studio/build'),
    });
  });

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/live-server') {
      wsServer.handleUpgrade(request, socket, head, (sock: any) => {
        wsServer.emit('connection', sock, request);
      });
    } else {
      socket.destroy();
    }
  });

  const wsServer = new WebSocketServer({ noServer: true });

  wsServer.on('connection', (socket: any) => {
    sockets.push(socket);
    getFileContent(filePath).then((code: string) => {
      messageQueue.push(JSON.stringify({
        type: 'file:loaded',
        code,
      }));
      sendQueuedMessages();
    });

    socket.on('message', (fileContent: string) => {
      saveFileContent(fileName, fileContent)
    });
  });
  
  wsServer.on('close', (socket: any) => {
    sockets.splice(sockets.findIndex(s => s === socket));
  });

  server.listen(3210, () => {
    const url = 'http://localhost:3000?liveServer=3210';
    console.log(`Studio is running at ${url}`);
    console.log(`Watching changes on file ${filePath}`);
    open(url);
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

function saveFileContent(fileName: string, fileContent: string): Promise<void> {
  return writeFile(fileName, fileContent, { encoding: 'utf8' })
    .catch(console.error);
}
