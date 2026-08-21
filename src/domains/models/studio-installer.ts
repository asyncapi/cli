import { existsSync } from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { confirm, isCancel, cancel, spinner } from '@clack/prompts';
import { blueBright } from 'picocolors';
import type { Config } from '@oclif/core';

/** Approximate on-disk size of @asyncapi/studio + deps, shown in the prompt. */
const STUDIO_DOWNLOAD_SIZE = '~450MB';

const STUDIO_PKG = '@asyncapi/studio';

/** Fallback version spec if the CLI package.json does not declare Studio. */
const DEFAULT_STUDIO_VERSION_SPEC = 'latest';

class StudioInstallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudioInstallError';
  }
}

/**
 * The @asyncapi/studio version spec to install on-demand.
 *
 * @asyncapi/studio (and its transitive `next` dependency) is intentionally NOT
 * a runtime dependency of the CLI because it adds ~450MB to every install while
 * only being needed by `start studio`, `start preview` and `new --studio`. It
 * is declared as a devDependency instead, so the version stays tracked (by
 * Dependabot) and locked (in package-lock.json) for development, while end-user
 * and Docker installs (`--omit=dev`) stay slim. The declared range is read here
 * and installed on first use into the CLI's per-user data directory.
 */
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

/**
 * Resolve @asyncapi/studio from the normal node_modules resolution (present if
 * the CLI is installed with Studio bundled, e.g. an older/full install).
 */
function resolveBundledStudioPath(): string | undefined {
  try {
    return path.dirname(require.resolve(`${STUDIO_PKG}/package.json`));
  } catch {
    return undefined;
  }
}

/** Path to Studio inside the CLI's per-user data directory. */
function dataDirStudioPath(dataDir: string): string {
  return path.join(dataDir, 'node_modules', '@asyncapi', 'studio');
}

function isStudioInstalledInDataDir(dataDir: string): boolean {
  return existsSync(path.join(dataDirStudioPath(dataDir), 'package.json'));
}

function installStudio(dataDir: string, versionSpec: string): void {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
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
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );

  if (result.status !== 0) {
    s.stop('Studio installation failed.');
    throw new StudioInstallError(
      `Failed to install ${STUDIO_PKG}@${versionSpec}. Please check your network connection and npm setup, or install the CLI with Studio bundled via "npm install -g @asyncapi/cli".`,
    );
  }

  s.stop('Studio installed.');
}

export interface EnsureStudioOptions {
  /** Auto-accept the install prompt (from --yes flag or env). */
  yes?: boolean;
  /** Disable interactive prompts. */
  noInteractive?: boolean;
}

export type StudioInstallDecision = 'install' | 'prompt' | 'decline';

export interface StudioInstallContext {
  /** `--yes` flag was passed. */
  yes?: boolean;
  /** `--no-interactive` flag was passed. */
  noInteractive?: boolean;
  /** Whether stdout is an interactive terminal. */
  isTTY: boolean;
  /** Whether ASYNCAPI_STUDIO_AUTO_INSTALL=1 is set. */
  envAutoInstall: boolean;
}

/**
 * Pure decision for how to obtain consent to install Studio on-demand:
 *   - `install`: auto-accepted (`--yes` or ASYNCAPI_STUDIO_AUTO_INSTALL=1).
 *   - `prompt`:  ask the user interactively (TTY, no auto-accept).
 *   - `decline`: cannot prompt (no TTY or --no-interactive) and not auto-accepted.
 *
 * Kept pure (no I/O) so the branching matrix is unit-testable.
 */
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

/**
 * Ensures @asyncapi/studio is available and returns the absolute path to its
 * package directory.
 *
 * Resolution order:
 *   1. Bundled in node_modules (full install).
 *   2. Previously installed into the CLI data directory.
 *   3. Install on-demand (after confirmation) into the data directory.
 *
 * In non-interactive contexts (no TTY or --no-interactive) it will not prompt;
 * it either auto-installs when `--yes`/ASYNCAPI_STUDIO_AUTO_INSTALL=1 is set, or
 * throws a clear, actionable error.
 */
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
