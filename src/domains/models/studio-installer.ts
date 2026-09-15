import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { confirm, isCancel, cancel, spinner } from '@clack/prompts';
import { blueBright } from 'picocolors';
import type { Config } from '@oclif/core';

const STUDIO_DOWNLOAD_SIZE = '~450MB';

const STUDIO_PKG = '@asyncapi/studio';

const DEFAULT_STUDIO_VERSION_SPEC = 'latest';

class StudioInstallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudioInstallError';
  }
}

export function getStudioVersionSpec(config: Pick<Config, 'pjson'>): string {
  const pjson = config.pjson as {
    devDependencies?: Record<string, string>;
    dependencies?: Record<string, string>;
  };
  return (
    pjson?.devDependencies?.[STUDIO_PKG] ??
    pjson?.dependencies?.[STUDIO_PKG] ??
    DEFAULT_STUDIO_VERSION_SPEC
  );
}

// Resolve bundled @asyncapi/studio path from node_modules if present like in case of an older cli install.
function resolveBundledStudioPath(): string | undefined {
  try {
    return path.dirname(require.resolve(`${STUDIO_PKG}/package.json`));
  } catch {
    return undefined;
  }
}

// Install studio per user data directory
function dataDirStudioPath(dataDir: string): string {
  return path.join(dataDir, 'node_modules', '@asyncapi', 'studio');
}

function isStudioInstalledInDataDir(dataDir: string): boolean {
  return existsSync(path.join(dataDirStudioPath(dataDir), 'package.json'));
}

function isExecutableNotFound(error?: Error): boolean {
  return (error as NodeJS.ErrnoException | undefined)?.code === 'ENOENT';
}

function resolveNpmExecutable(): string | undefined {
  const executableNames =
    process.platform === 'win32' ? ['npm.cmd', 'npm.exe', 'npm'] : ['npm'];

  for (const directory of (process.env.PATH ?? '').split(path.delimiter)) {
    const normalizedDirectory = directory.replace(/^"|"$/g, '');
    if (!normalizedDirectory) {
      continue;
    }

    for (const executableName of executableNames) {
      const executablePath = path.join(normalizedDirectory, executableName);
      if (existsSync(executablePath)) {
        return executablePath;
      }
    }
  }

  return undefined;
}

function npmUnavailableError(): StudioInstallError {
  return new StudioInstallError(
    'npm was not found on PATH. Standalone AsyncAPI CLI installers do not bundle npm, but npm is required to download Studio on-demand. Install Node.js and npm from https://nodejs.org/, then run "asyncapi studio install --yes" again. You can continue using all non-Studio CLI commands without npm.',
  );
}

export function installStudio(dataDir: string, versionSpec: string): void {
  const npm = resolveNpmExecutable();
  if (!npm) {
    throw npmUnavailableError();
  }

  const s = spinner();
  s.start(`Installing ${STUDIO_PKG}@${versionSpec} (${STUDIO_DOWNLOAD_SIZE})`);

  const result = spawnSync(
    npm,
    [
      'install',
      `${STUDIO_PKG}@${versionSpec}`,
      '--prefix',
      dataDir,
      '--no-audit',
      '--no-fund',
      '--loglevel',
      'error',
    ],
    {
      stdio: ['ignore', 'ignore', 'inherit'],
      shell: process.platform === 'win32',
    },
  );

  if (isExecutableNotFound(result.error)) {
    s.stop('Studio installation could not start.');
    throw npmUnavailableError();
  }

  if (result.status !== 0) {
    s.stop('Studio installation failed.');
    throw new StudioInstallError(
      `Failed to install ${STUDIO_PKG}@${versionSpec}. Check your network connection and npm configuration, then retry with "asyncapi studio install --yes".`,
    );
  }

  s.stop('Studio installed.');
}

export interface EnsureStudioOptions {
  yes?: boolean;
  noInteractive?: boolean;
}

export type StudioInstallDecision = 'install' | 'prompt' | 'decline';

export interface StudioInstallContext {
  yes?: boolean;
  noInteractive?: boolean;
  isTTY: boolean;
  envAutoInstall: boolean;
}

export function decideStudioInstall(
  ctx: StudioInstallContext,
): StudioInstallDecision {
  if (ctx.yes === true || ctx.envAutoInstall) {
    return 'install';
  }
  if (ctx.noInteractive || !ctx.isTTY) {
    return 'decline';
  }
  return 'prompt';
}

export async function ensureStudio(
  config: Config,
  options: EnsureStudioOptions = {},
): Promise<string> {
  const bundled = resolveBundledStudioPath();
  if (bundled) {
    return bundled;
  }

  const { dataDir } = config;
  if (isStudioInstalledInDataDir(dataDir)) {
    return dataDirStudioPath(dataDir);
  }

  const versionSpec = getStudioVersionSpec(config);

  const decision = decideStudioInstall({
    yes: options.yes,
    noInteractive: options.noInteractive,
    isTTY: Boolean(process.stdout.isTTY),
    envAutoInstall: process.env.ASYNCAPI_STUDIO_AUTO_INSTALL === '1',
  });

  if (decision === 'decline') {
    throw new StudioInstallError(
      `Studio is not installed. It requires an additional ${STUDIO_DOWNLOAD_SIZE} download (${STUDIO_PKG}). ` +
        'Re-run this command in an interactive terminal and accept the prompt, ' +
        'pass "--yes" to install automatically, ' +
        'or set ASYNCAPI_STUDIO_AUTO_INSTALL=1.',
    );
  }

  if (decision === 'prompt') {
    const proceed = await confirm({
      message: `Studio requires an additional ${STUDIO_DOWNLOAD_SIZE} download (${STUDIO_PKG}@${versionSpec}). Proceed?`,
      initialValue: true,
    });

    if (isCancel(proceed) || proceed === false) {
      cancel(
        `Studio is required to run this command. Install it later by re-running and accepting the prompt, or run "npm install ${STUDIO_PKG}@${versionSpec} --prefix ${blueBright(dataDir)}".`,
      );
      throw new StudioInstallError('Studio installation declined by user.');
    }
  }

  installStudio(dataDir, versionSpec);
  return dataDirStudioPath(dataDir);
}
