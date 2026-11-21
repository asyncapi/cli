import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Server } from 'node:http';
import open from 'open';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

export const DEFAULT_PORT = 0;

export type NextFactory = (config?: any) => any;

export function isValidFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

export function resolveStudioPath(feature: 'Studio' | 'Preview' = 'Studio'): string {
  try {
    return path.dirname(require.resolve('@asyncapi/studio/package.json'));
  } catch {
    throw new Error(
      `${feature} is not available in this installation. Run the command in an interactive terminal to install Studio on-demand, or pass "--yes" to install automatically.`,
    );
  }
}

export function getStudioVersion(studioPath?: string): string {
  try {
    const pkgPath = studioPath
      ? path.join(studioPath, 'package.json')
      : require.resolve('@asyncapi/studio/package.json');
    return require(pkgPath).version;
  } catch {
    return 'unknown';
  }
}

// Using require here is necessary for dynamic module resolution.
export function resolveStudioNextInstance(studioPath: string): NextFactory {
  const resolvedNextPath = require.resolve('next', { paths: [studioPath] });
  const nextModule = require(resolvedNextPath);
  return nextModule.default ?? nextModule;
}

export interface ListeningServer {
  host: string | null;
  port: number;
}

export function listenOnPort(
  server: Server,
  port: number,
  serverName: string,
): Promise<ListeningServer> {
  return new Promise((resolve, reject) => {
    const onError = (error: NodeJS.ErrnoException) => {
      const inUse = error.code === 'EADDRINUSE';
      reject(new ApplicationError(
        inUse ? CLI_ERROR_CODES.SERVER_PORT_IN_USE : CLI_ERROR_CODES.SERVER_START_FAILED,
        inUse
          ? `Port ${port} is already in use.`
          : `Failed to start ${serverName} server on port ${port}: ${error.message}`,
        { cause: error, details: { port } },
      ));
    };

    server.once('error', onError);
    server.listen(port, () => {
      server.removeListener('error', onError);
      const address = server.address();
      if (address && typeof address === 'object') {
        resolve({ host: address.address, port: address.port });
      } else {
        resolve({ host: null, port });
      }
    });
  });
}

/** Opens the URL in the default browser, logging failures unless quiet. */
export function openInBrowser(url: string, quiet: boolean): void {
  open(url).catch((error) => {
    if (!quiet) {
      console.error(error);
    }
  });
}
