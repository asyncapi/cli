import { SpecificationFileNotFound } from '@errors/specification-file';
import { existsSync, readFileSync } from 'fs';
import bundle from '@asyncapi/bundler';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import open from 'open';
import path from 'path';
import yaml from 'js-yaml';
import { blueBright, redBright, yellow } from 'picocolors';

const sockets: any[] = [];
const messageQueue: string[] = [];
const filePathsToWatch: Set<string> = new Set<string>();
const defaultErrorMessage = 'error occured while bundling files. use --detailedLog or -l flag to get more details.';

export const DEFAULT_PORT = 0;

function isValidFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

type NextFactory = (config?: any) => any;

async function getStudioInfo(): Promise<{ path?: string; version?: string } | null> {
  try {
    // @ts-ignore
    const pkg = await import('@asyncapi/studio/package.json');
    const pkgPath = require.resolve('@asyncapi/studio/package.json');
    return {
      version: pkg?.default?.version || pkg?.version,
      path: path.dirname(pkgPath),
    };
  } catch (e) {
    return null;
  }
}

function resolveStudioNextInstanceSafe(studioPath: string): NextFactory {
  try {
    const resolvedNextPath = require.resolve('next', { paths: [studioPath] });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nextModule = require(resolvedNextPath);
    return nextModule.default ?? nextModule;
  } catch (err) {
    console.error(redBright('\n❌ Error: `next` package could not be resolved from Studio installation.'));
    console.error(yellow('Please ensure `next` is available in the Studio installation or install it alongside @asyncapi/studio.'));
    console.error('  npm install next\n');
    throw err;
  }
}

export async function startPreview(
  filePath: string,
  base: string | undefined,
  baseDirectory: string | undefined,
  xOrigin: boolean | undefined,
  suppressLogs: boolean | undefined,
  port: number = DEFAULT_PORT,
  noBrowser?: boolean,
): Promise<void> {
  // Validate file path gracefully
  if (filePath && !isValidFilePath(filePath)) {
    console.error(redBright(`Specification file not found: ${filePath}`));
    return;
  }

  const baseDir = path.dirname(path.resolve(filePath || '.'));

  let bundleError = true;
  try {
    const doc = await bundle(filePath);
    if (doc) bundleError = false;
  } catch (err: any) {
    if (suppressLogs) console.log(defaultErrorMessage);
    else console.log(err);
  }

  const studioInfo = await getStudioInfo();
  const studioVersion = studioInfo?.version || '0.0.0';
  const studioPath = studioInfo?.path;

  if (!studioPath) {
    console.error(redBright('\n❌ Error: @asyncapi/studio is not installed or could not be resolved.'));
    console.error(yellow('Preview requires @asyncapi/studio to be installed.'));
    console.error(blueBright('\nTo use this feature, please run:'));
    console.error('  npm install @asyncapi/studio\n');
    return;
  }

  let app: any;
  try {
    const nextInstance = resolveStudioNextInstanceSafe(studioPath);
    app = nextInstance({ dev: false, dir: studioPath, conf: { distDir: 'build' } as any });
  } catch (err) {
    return;
  }

  const handle = app.getRequestHandler();
  const wsServer = new WebSocketServer({ noServer: true });

  wsServer.on('connection', (socket: any) => {
    sockets.push(socket);
    // remove socket when it closes
    socket.on('close', () => {
      const idx = sockets.indexOf(socket);
      if (idx !== -1) sockets.splice(idx, 1);
    });
    sendQueuedMessages();
  });

  try {
    await app.prepare();
  } catch (err) {
    console.error(redBright('Failed to prepare Studio application'));
    if (!suppressLogs) console.error(err);
    return;
  }

  if (filePath && !bundleError) {
    messageQueue.push(JSON.stringify({ type: 'preview:connected', code: 'Preview server connected' }));
    sendQueuedMessages();
    try {
      findPathsToWatchFromSchemaRef(filePath, baseDir);
      filePathsToWatch.add(path.resolve(baseDir, filePath));
    } catch (err) {
      // ignore path discovery errors
    }

    chokidar.watch([...filePathsToWatch]).on('all', async (event, changedPath) => {
      if (!changedPath) changedPath = filePath;
      if (event === 'add' || event === 'change') {
        try {
          const doc = await bundle([filePath], { base, baseDir: baseDirectory, xOrigin });
          const code = (path.extname(filePath) === '.yaml' || path.extname(filePath) === '.yml') ? doc.yml() : doc.string();
          messageQueue.push(JSON.stringify({ type: `preview:file:${event === 'add' ? 'added' : 'changed'}`, code }));
          sendQueuedMessages();
        } catch (e) {
          if (suppressLogs) console.log(defaultErrorMessage);
          else console.log(e);
        }
      } else if (event === 'unlink') {
        messageQueue.push(JSON.stringify({ type: 'preview:file:deleted', filePath }));
        sendQueuedMessages();
      }
    });
  }

  const server = createServer((req, res) => {
    if (req.url === '/close') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Shutting down server');
      for (const client of wsServer.clients) {
        try {
          client.close();
        } catch {
          // ignore
        }
      }
      server.close(() => process.exit(0));
      return;
    }
    handle(req, res);
  });

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/preview-server' && request.headers['origin'] === `http://localhost:${port}`) {
      wsServer.handleUpgrade(request, socket, head, (sock: any) => wsServer.emit('connection', sock, request));
    } else {
      socket.destroy();
    }
  });

  if (!bundleError) {
    server.listen(port, () => {
      const previewServerAddr = server.address();
      const currentPort = (previewServerAddr && typeof previewServerAddr === 'object' && 'port' in previewServerAddr) ? (previewServerAddr as any).port : port;
      const url = `http://localhost:${currentPort}?previewServer=${currentPort}&studio-version=${studioVersion}`;
      console.log(`🎉 Connected to Preview Server running at ${blueBright(url)}.`);
      console.log(`🌐 Open this URL in your web browser: ${blueBright(url)}`);
      console.log(`🛑 If needed, press ${redBright('Ctrl + C')} to stop the server.`);

      if (filePath) {
        for (const entry of filePathsToWatch) console.log(`👁️ Watching changes on file ${blueBright(entry)}`);
      } else {
        console.warn('Warning: No file was provided; starting Studio with a blank workspace.');
      }
      if (!bundleError && !noBrowser) open(url);
    }).on('error', (error: any) => {
      if (error && error.message && error.message.includes('EADDRINUSE')) {
        console.error(redBright(`Error: Port ${port} is already in use.`));
        process.exit(1);
      } else {
        console.error('Failed to start server on port', port, error);
      }
    });
  }
}

function sendQueuedMessages(): void {
  while (messageQueue.length && sockets.length) {
    const nextMessage = messageQueue.shift();
    for (const socket of [...sockets]) {
      try {
        if (socket && typeof socket.readyState === 'number' && socket.readyState === 1) {
          socket.send(nextMessage);
        } else {
          const idx = sockets.indexOf(socket);
          if (idx !== -1) sockets.splice(idx, 1);
        }
      } catch (err) {
        const idx = sockets.indexOf(socket);
        if (idx !== -1) sockets.splice(idx, 1);
      }
    }
  }
}

function isLocalRefAPath(key: string, value: any): boolean {
  return (typeof value === 'string' && key === '$ref' && (value.startsWith('.') || value.startsWith('./') || value.startsWith('../') || !value.startsWith('#')));
}

function findPathsToWatchFromSchemaRef(filePath: string, baseDir: string) {
  if (filePath && !isValidFilePath(filePath)) {
    throw new SpecificationFileNotFound(filePath);
  }
  const document = yaml.load(readFileSync(filePath, 'utf-8'));
  const stack: object[] = [document as object];

  while (stack.length > 0) {
    const current = stack.pop();
    if (current === null || typeof current !== 'object') continue;
    for (const [key, value] of Object.entries(current)) {
      if (isLocalRefAPath(key, value)) {
        const absolutePath = path.resolve(baseDir, value as string);
        filePathsToWatch.add(absolutePath);
      }
      if (value !== null && typeof value === 'object') stack.push(value as object);
    }
  }
}
