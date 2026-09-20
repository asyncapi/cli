'use strict';

/**
 * Used as changesets/action `publish`. Tags unpublished workspace packages,
 * creates the CLI GitHub Release (`v<version>`), and prints
 * `New tag: <name>@<version>` for each. npm publish is the next workflow step.
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const GIT = '/usr/bin/git';
const GH = '/usr/bin/gh';

const ROOT_DIR = path.resolve(__dirname, '..');
const MAX_WORKSPACE_PATTERNS = 16;
const MAX_PACKAGES_PER_GLOB = 32;
const MAX_PACKAGE_NAME_LENGTH = 214;
const MAX_VERSION_LENGTH = 64;
const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/;
const WORKSPACE_GLOB_PATTERN = /^(?:\.|[a-zA-Z0-9._-]+\/\*)$/;

function main() {
  const rootPackage = readPackageJson(ROOT_DIR);
  const workspacePatterns = Array.isArray(rootPackage.workspaces) ? rootPackage.workspaces : ['.'];
  const packages = listWorkspacePackages(ROOT_DIR, workspacePatterns);
  const unpublished = [];

  for (const pkg of packages) {
    if (pkg.private) {
      continue;
    }
    if (isVersionOnNpm(pkg.name, pkg.version)) {
      console.log(`Version ${pkg.version} of package ${pkg.name} already published to NPM. Skipping.`);
      continue;
    }
    unpublished.push(pkg);
  }

  if (unpublished.length === 0) {
    console.log('All workspace package versions are already on NPM. Skipping GitHub release.');
    return;
  }

  const cliPackage = unpublished.find((pkg) => pkg.dir === ROOT_DIR);
  if (cliPackage) {
    const cliTag = `v${cliPackage.version}`;
    createGitTag(cliTag);
    createGithubRelease(cliTag);
  }

  for (const pkg of unpublished) {
    console.log(`New tag: ${pkg.name}@${pkg.version}`);
  }
}

function listWorkspacePackages(rootDir, workspacePatterns) {
  if (workspacePatterns.length > MAX_WORKSPACE_PATTERNS) {
    throw new Error(`Too many workspace patterns (max ${MAX_WORKSPACE_PATTERNS}).`);
  }

  const packages = [];
  const seenDirs = new Set();

  for (const pattern of workspacePatterns) {
    if (typeof pattern !== 'string' || !WORKSPACE_GLOB_PATTERN.test(pattern)) {
      throw new Error(`Unsupported workspace pattern: ${String(pattern)}`);
    }

    const dirs = resolveWorkspacePattern(rootDir, pattern);
    for (const dir of dirs) {
      if (seenDirs.has(dir)) {
        continue;
      }
      seenDirs.add(dir);
      packages.push(readWorkspacePackage(dir));
    }
  }

  return packages;
}

function resolveWorkspacePattern(rootDir, pattern) {
  if (pattern === '.') {
    return [rootDir];
  }

  const parentName = pattern.slice(0, -2);
  const parentDir = resolveWithinRoot(rootDir, path.join(rootDir, parentName));
  if (!fs.existsSync(parentDir) || !fs.statSync(parentDir).isDirectory()) {
    return [];
  }

  const entries = fs.readdirSync(parentDir);
  if (entries.length > MAX_PACKAGES_PER_GLOB) {
    throw new Error(`Too many entries in ${parentName}/ (max ${MAX_PACKAGES_PER_GLOB}).`);
  }

  const dirs = [];
  for (const entry of entries) {
    const candidate = resolveWithinRoot(rootDir, path.join(parentDir, entry));
    const packageJsonPath = path.join(candidate, 'package.json');
    if (fs.existsSync(packageJsonPath) && fs.statSync(candidate).isDirectory()) {
      dirs.push(candidate);
    }
  }
  return dirs;
}

function readWorkspacePackage(dir) {
  const packageJson = readPackageJson(dir);
  const name = assertPackageName(packageJson.name);
  const version = assertVersion(packageJson.version);
  return {
    dir,
    name,
    version,
    private: packageJson.private === true,
  };
}

function readPackageJson(dir) {
  const packageJsonPath = path.join(dir, 'package.json');
  const raw = fs.readFileSync(packageJsonPath, { encoding: 'utf8' });
  return JSON.parse(raw);
}

function resolveWithinRoot(rootDir, targetPath) {
  const root = path.resolve(rootDir);
  const resolved = path.resolve(targetPath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error('Path escapes workspace root.');
  }
  return resolved;
}

function assertPackageName(name) {
  if (typeof name !== 'string' || name.length === 0 || name.length > MAX_PACKAGE_NAME_LENGTH) {
    throw new Error('Invalid package name length.');
  }
  if (!PACKAGE_NAME_PATTERN.test(name)) {
    throw new Error(`Invalid package name: ${name}`);
  }
  return name;
}

function assertVersion(version) {
  if (typeof version !== 'string' || version.length === 0 || version.length > MAX_VERSION_LENGTH) {
    throw new Error('Invalid package version length.');
  }
  if (!VERSION_PATTERN.test(version)) {
    throw new Error(`Invalid package version: ${version}`);
  }
  return version;
}

function isVersionOnNpm(name, version) {
  const npmCli = path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js');
  if (!fs.existsSync(npmCli)) {
    throw new Error('npm CLI not found next to the Node executable.');
  }
  const result = spawnSync(process.execPath, [npmCli, 'view', `${name}@${version}`, 'version'], {
    encoding: 'utf8',
    cwd: ROOT_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return result.status === 0 && result.stdout.trim() === version;
}

function gitRefExists(ref) {
  const result = spawnSync(GIT, ['rev-parse', '-q', '--verify', ref], {
    cwd: ROOT_DIR,
    stdio: 'ignore',
  });
  return result.status === 0;
}

function createGitTag(tag) {
  assertCliGitTag(tag);
  if (gitRefExists(`refs/tags/${tag}`)) {
    console.log(`Git tag ${tag} already exists.`);
    return;
  }

  const result = spawnSync(GIT, ['tag', tag, '-m', tag], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(`Failed to create git tag ${tag}: ${result.stderr || result.stdout}`);
  }
  console.log(`Created git tag ${tag}.`);
}

function assertCliGitTag(tag) {
  if (typeof tag !== 'string' || tag.length > MAX_VERSION_LENGTH + 1 || !/^v\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(tag)) {
    throw new Error(`Invalid CLI git tag: ${String(tag)}`);
  }
}

function createGithubRelease(tag) {
  assertCliGitTag(tag);

  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
  if (!token) {
    console.log('GH_TOKEN not set; skipping GitHub Release creation.');
    return;
  }

  const ghCheck = spawnSync(GH, ['--version'], { stdio: 'ignore' });
  if (ghCheck.status !== 0) {
    console.log('gh CLI not available; skipping GitHub Release creation.');
    return;
  }

  const env = { ...process.env, GH_TOKEN: token };
  const existing = spawnSync(GH, ['release', 'view', tag], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (existing.status === 0) {
    console.log(`GitHub Release ${tag} already exists.`);
    return;
  }

  const created = spawnSync(GH, ['release', 'create', tag, '--title', tag, '--generate-notes'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (created.status !== 0) {
    throw new Error(`Failed to create GitHub Release ${tag}: ${created.stderr || created.stdout}`);
  }
  console.log(`Created GitHub Release ${tag}.`);
}

main();
