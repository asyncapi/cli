import { existsSync, promises as fPromises } from 'fs';
import { SpecificationFileNotFound } from '../errors/specification-file';
import { createServer } from 'http';
import serveHandler from 'serve-handler';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import open from 'open';
import path from 'path';
import fs from 'fs'

const { readFile, writeFile } = fPromises; 

const sockets: any[] = [];
const messageQueue: string[] = [];

export const DEFAULT_PORT = 3210;

function isValidFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

export function startOnline(filePath: string, port: number = DEFAULT_PORT): void {
  if (!isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath)
  }

  const server = createServer((request, response) => {

    if (request.url === '/fileread') {
      var extname = path.extname(filePath);
      var contentType = 'text/html';
      switch (extname) {
        case '.json':
          contentType = 'application/json';
          break;
      }
      const headers = {
        'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      };

      fs.readFile(filePath, (error, content) => {
        response.writeHead(200, { 'content-Type': contentType, ...headers })
        response.end(content, 'utf-8')
      })
    }
  })

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/filesave') {
      wsServer.handleUpgrade(request, socket, head, (sock: any) => {
        wsServer.emit('connection', sock, request)
      })
    } else {
      socket.destroy()
    }
  })

  const wsServer = new WebSocketServer({ noServer: true })

  wsServer.on('connection', (socket: any) => {
    sockets.push(socket)
    getFileContent(filePath).then((code: string) => {
      messageQueue.push(JSON.stringify({
        type: 'file:loaded',
        code
      }));
      sendQueuedMessages();
    })

    socket.on('message', (event: string) => {
      try {
        const json: any = JSON.parse(event);
        if (json.type === 'file:update') {
          saveFileContent(filePath, json.code);
        } else {
          console.warn('Live Server: An unkown event has been received. See details:');
          console.log(json)
        }
      } catch (error) {
        console.error(`Live Server: An invalid event has been received. See details:\n${event}`)
      }
    })
    wsServer.on('close', (socekt: any) => {
      sockets.splice(sockets.findIndex(s => s === socket))
    })
  })

  server.listen(port, () => {
    const url = `https://studio.asyncapi.com/?url=http://localhost:${port}/fileread&url_save=http://localhost:${port}/filesave`
    console.log(`Studio is running at ${url}`)
    open(url)
  })

}

export function start(filePath: string, port: number = DEFAULT_PORT): void {
  if (!isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }
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

  const server = createServer((request, response) => {
    //not all CLI users use npm. Some package managers put dependencies in different weird places
    //this is why we need to first figure out where exactly is the index.html located 
    //and then strip index.html from the path to point to directory with the rest of the studio
    const indexLocation = require.resolve('@asyncapi/studio/build/index.html');
    const hostFolder = indexLocation.substring(0, indexLocation.lastIndexOf(path.sep));
    return serveHandler(request, response, {
      public: hostFolder,
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

    socket.on('message', (event: string) => {
      try {
        const json: any = JSON.parse(event);
        if (json.type === 'file:update') {
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

  server.listen(port, () => {
    const url = `http://localhost:${port}?liveServer=${port}`;
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

function saveFileContent(filePath: string, fileContent: string): void {
  writeFile(filePath, fileContent, { encoding: 'utf8' })
    .catch(console.error);
}
