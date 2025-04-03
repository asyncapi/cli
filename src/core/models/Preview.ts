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
const defaultErrorMessage = 'error occured while bundling files. use --detailedLog or -l flag to get more details.';

let bundleError = true;

export const DEFAULT_PORT = 3210;

function isValidFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function startPreview(filePath:string,base:string | undefined,baseDirectory:string | undefined ,xOrigin:boolean | undefined,suppressLogs:boolean|undefined,port: number = DEFAULT_PORT):void {
  if (filePath && !isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }
  
  const baseDir = path.dirname(path.resolve(filePath));
  bundle(filePath).then((doc) => {
    if (doc) {
      bundleError = false;
    }
  }).catch((err) => {
    if (suppressLogs) {
      console.log(defaultErrorMessage);
    } else {
      console.log(err);
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
    if (filePath && !bundleError) {
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
    
    if (!bundleError) {
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
      }).on('error', (error) => {
        console.error(`Failed to start server on port ${port}:`, error.message);
      }); 
    }
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

