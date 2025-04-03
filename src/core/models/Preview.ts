import { SpecificationFileNotFound } from '../errors/specification-file';
import { existsSync,readFileSync } from 'fs';
import bundle from '@asyncapi/bundler';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import open from 'open';
import next from 'next';
import path from 'path';
import yaml from 'js-yaml';
import { blueBright, redBright } from 'picocolors';
import { version as studioVersion } from '@asyncapi/studio/package.json';

const sockets: any[] = [];
const messageQueue: string[] = [];
const filePathsToWatch: Set<string> = new Set<string>();

let bundleError = true;

export const DEFAULT_PORT = 3210;

function isValidFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function startPreview(filePath:string,port: number = DEFAULT_PORT):void {
  if (filePath && !isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }
  
  const baseDir = path.dirname(path.resolve(filePath));
  bundle(filePath).then((doc) => {
    if (doc) {
      bundleError = false;
    }
  });

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

  wsServer.on('connection',(socket:any) => {
    sockets.push(socket);
    sendQueuedMessages();
  });

  wsServer.on('close', (socket: any) => {
    sockets.splice(sockets.findIndex(s => s === socket));
  });

  app.prepare().then(() => {
    if (filePath) {
      messageQueue.push(JSON.stringify({
        type: 'preview:connected',
        code: 'Preview server connected'
      }));
      sendQueuedMessages();
      findPathsToWatchFromSchemaRef(filePath,baseDir);
      filePathsToWatch.add(path.resolve(baseDir, filePath));
      chokidar.watch([...filePathsToWatch]).on('all',(event) => {
        switch (event) {
        case 'add':
          bundle([filePath],{
            base: undefined,
            baseDir: undefined,
            xOrigin: undefined,
          }).then((intitalDocument) => {
            messageQueue.push(JSON.stringify({
              type: 'preview:file:added',
              code: (path.extname(filePath) === '.yaml' || path.extname(filePath) === '.yml') ? 
                intitalDocument.yml() : intitalDocument.string()
            }));
            sendQueuedMessages();
          }).catch((e) => {
            console.log('An error occured while bundling files.\n',e);
          });
          break;
        case 'change':
          bundle([filePath],{
            base: undefined,
            baseDir: undefined,
            xOrigin: undefined,
          }).then((modifiedDocument) => {
            messageQueue.push(JSON.stringify({
              type: 'preview:file:changed',
              code: (path.extname(filePath) === '.yaml' || path.extname(filePath) === '.yml') ? 
                modifiedDocument.yml() : modifiedDocument.string()
            }));
            sendQueuedMessages();
          }).catch((error) => {
            console.log('An error occured while bundling the modified files. \n');
            console.log(error);
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
    const server = createServer((req, res) => handle(req, res));

    server.on('upgrade', (request, socket, head) => {
      if (request.url === '/preview-server' && request.headers['origin'] === `http://localhost:${port}`) {
        console.log('🔗 WebSocket connection established for the preview.');
        wsServer.handleUpgrade(request, socket, head, (sock: any) => {
          wsServer.emit('connection', sock, request);
        });
      } else {
        console.log('🔗 WebSocket connection not established.');
        socket.destroy();
      }
    });
  
    server.listen(port, () => {
      const url = `http://localhost:${port}?previewServer=${port}&studio-version=${studioVersion}`;
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
      if (!bundleError) {
        open(url);
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

