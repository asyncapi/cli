import { existsSync } from 'fs';
import path from 'path';

export const DEFAULT_PORT = 0;

export type NextFactory = (config?: any) => any;

export function isValidFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * @asyncapi/studio is an optional, on-demand dependency (installed on first use
 * into the CLI data directory, see studio-installer.ts). Resolving it lazily
 * means commands which only reference the Studio/Preview modules (like
 * `new file` without `--studio`) keep working even when Studio is not installed.
 *
 * @param feature label used in the error message ("Studio" or "Preview").
 */
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
