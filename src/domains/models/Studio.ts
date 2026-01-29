import { existsSync, promises as fPromises } from 'fs';
import { SpecificationFileNotFound } from '@errors/specification-file';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import open from 'open';
import path from 'path';
import { blueBright, redBright, yellow } from 'picocolors';

const { readFile, writeFile } = fPromises;
const sockets: any[] = [];
const messageQueue: string[] = [];

export const DEFAULT_PORT = 0;

function isValidFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

// Helper: dynamically obtain Studio package info if installed
async function getStudioInfo(): Promise<{ path: string; version?: string } | null> {
  try {
    // @ts-ignore
    const pkg = await import('@asyncapi/studio/package.json');
    // resolve package path so we can point Next to the installed dir
    const pkgPath = require.resolve('@asyncapi/studio/package.json');
    return {
      version: pkg?.default?.version || pkg?.version,
      path: path.dirname(pkgPath),
    };
  } catch (e) {
    return null;
  }
}

type NextFactory = (config?: any) => any;

function resolveStudioNextInstance(studioPath: string): NextFactory {
  try {
    const resolvedNextPath = require.resolve('next', { paths: [studioPath] });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nextModule = require(resolvedNextPath);
    return nextModule.default ?? nextModule;
  } catch (err) {
    console.error(redBright('\n❌ Error: `next` package could not be resolved from Studio installation.'));
    console.error(yellow('Please ensure `next` is available in the Studio installation or install it alongside @asyncapi/studio.'));
    console.error('  npm install next\n');
    process.exit(1);
  }
}

export async function start(filePath: string | undefined, port: number = DEFAULT_PORT, noBrowser?: boolean): Promise<void> {
  if (filePath && !isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }

  console.log(blueBright('Checking for AsyncAPI Studio...'));

  const studioInfo = await getStudioInfo();

  if (!studioInfo) {
    console.error(redBright('\n❌ Error: @asyncapi/studio is not installed.'));
    console.error(yellow('The Studio is now optional to make the CLI faster.'));
    console.error(blueBright('\nTo use this feature, please run:'));
    console.error('  npm install @asyncapi/studio\n');
    process.exit(1);
    return;
  }

  const { path: studioPath, version: studioVersion } = studioInfo;
  console.log(blueBright(`Found Studio${studioVersion ? ` v${studioVersion}` : ''} at ${studioPath}`));

  const nextInstance = resolveStudioNextInstance(studioPath);
  const app = nextInstance({
    dev: false,
    dir: studioPath,
    conf: { distDir: 'build' } as any,
  });

  const handle = app.getRequestHandler();
  const wsServer = new WebSocketServer({ noServer: true });

  wsServer.on('connection', (socket: any) => {
    sockets.push(socket);
    if (filePath) {
      getFileContent(filePath).then((code) => {
        messageQueue.push(JSON.stringify({ type: 'file:loaded', code }));
        sendQueuedMessages();
      }).catch(() => {
        messageQueue.push(JSON.stringify({ type: 'file:loaded', code: '' }));
        sendQueuedMessages();
      });
    } else {
      messageQueue.push(JSON.stringify({ type: 'file:loaded', code: '' }));
      sendQueuedMessages();
    }

    socket.on('message', (event: string) => {
      try {
        const json = JSON.parse(event);
        if (filePath && json.type === 'file:update') {
          saveFileContent(filePath, json.code);
        }
      } catch {
        // ignore malformed messages
      }
    });
    // Clean up this socket when it closes
    socket.on('close', () => {
      const idx = sockets.indexOf(socket);
      if (idx !== -1) sockets.splice(idx, 1);
    });
  });


  await app.prepare();

  if (filePath) {
    chokidar.watch(filePath).on('all', (event, changedPath) => {
      if (['add', 'change'].includes(event)) {
        getFileContent(changedPath).then((code) => {
          messageQueue.push(JSON.stringify({ type: 'file:changed', code }));
          sendQueuedMessages();
        }).catch(() => void 0);
      }
    });
  }

  const server = createServer((req, res) => {
    if (req.url === '/close') {
      wsServer.clients.forEach((socket: any) => socket.close());
      res.end(JSON.stringify({ message: 'Server is shutting down' }));
      server.close(() => process.exit(0));
      return;
    }
    handle(req, res);
  });

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/live-server') {
      wsServer.handleUpgrade(request, socket, head, (sock: any) => wsServer.emit('connection', sock, request));
    } else {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    const addr = server.address();
    const listenPort = (addr && typeof addr === 'object') ? addr.port : port;
    const url = `http://localhost:${listenPort}?liveServer=${listenPort}&studio-version=${studioVersion || ''}`;
    console.log(`🎉 Studio is running at ${blueBright(url)}`);
    if (!noBrowser) open(url);
  });
}

function sendQueuedMessages(): void {
  while (messageQueue.length && sockets.length) {
    const nextMessage = messageQueue.shift();
    sockets.forEach((s) => {
      try {
        // only send to open sockets (1 === OPEN)
        if ((s && typeof s.readyState === 'number' && s.readyState === 1) || (s && s.OPEN && s.readyState === s.OPEN)) {
          s.send(nextMessage);
        }
      } catch (e) {
        // ignore send errors and remove closed sockets
        try {
          const idx = sockets.indexOf(s);
          if (idx !== -1) sockets.splice(idx, 1);
        } catch {
          // swallow
        }
      }
    });
  }
}

function getFileContent(filePath: string): Promise<string> {
  return readFile(filePath, { encoding: 'utf8' });
}

function saveFileContent(filePath: string, fileContent: string): void {
  writeFile(filePath, fileContent, { encoding: 'utf8' }).catch(console.error);
}