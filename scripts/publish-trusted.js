'use strict';

/**
 * Two modes:
 * - default: changesets/action publish hook. Creates GitHub Release `v<cli-version>`
 *   with `gh release create --target <commit>`. Does not create package releases.
 * - `--package-releases-only`: run after `changeset publish`. Creates GitHub Releases
 *   for workspace packages under `packages/` that this job just tagged, and only
 *   when that version is already on npm.
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
const MAX_TAG_LENGTH = MAX_PACKAGE_NAME_LENGTH + 1 + MAX_VERSION_LENGTH;
const MAX_HEAD_TAGS = 64;
const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/;
const WORKSPACE_GLOB_PATTERN = /^(?:\.|[a-zA-Z0-9._-]+\/\*)$/;
const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/i;
const SCOPED_PACKAGE_TAG_PATTERN = /^(@[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-~][a-z0-9-._~]*)@(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)$/;
const PACKAGE_RELEASES_FLAG = '--package-releases-only';

function main() {
  const args = process.argv.slice(2);
  if (args.length > 1) {
    throw new Error('Too many arguments.');
  }
  if (args.length === 1) {
    if (args[0] !== PACKAGE_RELEASES_FLAG) {
      throw new Error(`Unknown argument. Usage: node scripts/publish-trusted.js [${PACKAGE_RELEASES_FLAG}]`);
    }
    createPackageReleasesForHeadTags();
    return;
  }
  publishCliRelease();
}

function publishCliRelease() {
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

  const cliPackage = packages.find((pkg) => pkg.dir === ROOT_DIR && !pkg.private);
  if (cliPackage && !isVersionOnNpm(cliPackage.name, cliPackage.version)) {
    createGithubRelease(`v${cliPackage.version}`, cliPackage.version);
  }

  for (const pkg of unpublished) {
    if (pkg.dir === ROOT_DIR) {
      continue;
    }
    console.log(`Workspace package ${pkg.name}@${pkg.version} is unpublished. changeset publish will publish it.`);
  }
}

function createPackageReleasesForHeadTags() {
  const token = requireGithubToken();
  assertGhAvailable();
  const packages = listWorkspacePackages(
    ROOT_DIR,
    workspacePatternsFromRoot(),
  );
  const tags = listHeadTags();
  let created = 0;

  for (const rawTag of tags) {
    const parsed = parseScopedPackageTag(rawTag);
    if (!parsed) {
      continue;
    }
    const pkg = packages.find((candidate) => candidate.name === parsed.name && isPackagesDirectory(candidate.dir) && !candidate.private);
    if (!pkg) {
      continue;
    }
    if (pkg.version !== parsed.version) {
      throw new Error(`Tag ${parsed.tag} does not match package.json version ${pkg.version}.`);
    }
    if (!isVersionOnNpm(pkg.name, pkg.version)) {
      throw new Error(`Refusing to create a GitHub Release for ${parsed.tag} because that version is not on npm.`);
    }
    createPackageGithubRelease(parsed.tag, parsed.version, token);
    created += 1;
  }

  if (created === 0) {
    console.log('No workspace package tags at HEAD to publish as GitHub Releases.');
  }
}

function workspacePatternsFromRoot() {
  const rootPackage = readPackageJson(ROOT_DIR);
  return Array.isArray(rootPackage.workspaces) ? rootPackage.workspaces : ['.'];
}

function isPackagesDirectory(dir) {
  const packagesDir = path.resolve(ROOT_DIR, 'packages');
  const resolved = path.resolve(dir);
  return resolved.startsWith(packagesDir + path.sep);
}

function listHeadTags() {
  const result = spawnSync(GIT, ['tag', '--points-at', 'HEAD'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(`Could not list git tags at HEAD: ${result.stderr || result.stdout}`);
  }
  const tags = (result.stdout || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (tags.length > MAX_HEAD_TAGS) {
    throw new Error(`Too many tags at HEAD (max ${MAX_HEAD_TAGS}).`);
  }
  return tags;
}

function parseScopedPackageTag(tag) {
  if (typeof tag !== 'string' || tag.length === 0 || tag.length > MAX_TAG_LENGTH) {
    return null;
  }
  const match = SCOPED_PACKAGE_TAG_PATTERN.exec(tag);
  if (!match) {
    return null;
  }
  const name = assertPackageName(match[1]);
  const version = assertVersion(match[2]);
  return { tag, name, version };
}

function requireGithubToken() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
  if (!token) {
    throw new Error('GH_TOKEN is required to create workspace package releases.');
  }
  return token;
}

function assertGhAvailable() {
  const ghCheck = spawnSync(GH, ['--version'], { stdio: 'ignore' });
  if (ghCheck.status !== 0) {
    throw new Error('gh CLI is not available.');
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

function assertCliGitTag(tag) {
  if (typeof tag !== 'string' || tag.length > MAX_VERSION_LENGTH + 1 || !/^v\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(tag)) {
    throw new Error(`Invalid CLI git tag: ${String(tag)}`);
  }
}

function resolveReleaseTargetSha() {
  const envSha = typeof process.env.GITHUB_SHA === 'string' ? process.env.GITHUB_SHA.trim() : '';
  if (COMMIT_SHA_PATTERN.test(envSha)) {
    return envSha.toLowerCase();
  }

  const result = spawnSync(GIT, ['rev-parse', 'HEAD'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const sha = (result.stdout || '').trim();
  if (result.status !== 0 || !COMMIT_SHA_PATTERN.test(sha)) {
    throw new Error('Could not determine a valid commit SHA for GitHub Release --target.');
  }
  return sha.toLowerCase();
}

function createGithubRelease(tag, version) {
  assertCliGitTag(tag);
  assertVersion(version);

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

  const sha = resolveReleaseTargetSha();
  const args = ['release', 'create', tag, '--title', tag, '--generate-notes', '--target', sha];
  if (version.includes('-')) {
    args.push('--prerelease');
  }

  const created = spawnSync(GH, args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (created.status !== 0) {
    throw new Error(`Failed to create GitHub Release ${tag}: ${created.stderr || created.stdout}`);
  }
  console.log(`Created GitHub Release ${tag} at ${sha}.`);
}

function createPackageGithubRelease(tag, version, token) {
  const parsed = parseScopedPackageTag(tag);
  if (!parsed || parsed.version !== version) {
    throw new Error('Invalid package release tag.');
  }
  assertVersion(version);

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

  const sha = resolveReleaseTargetSha();
  const notes = `Release ${tag}.`;
  const args = ['release', 'create', tag, '--title', tag, '--notes', notes, '--target', sha];
  if (version.includes('-')) {
    args.push('--prerelease');
  }

  const created = spawnSync(GH, args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (created.status !== 0) {
    throw new Error(`Failed to create GitHub Release ${tag}: ${clipCommandOutput(created.stderr || created.stdout)}`);
  }
  console.log(`Created GitHub Release ${tag} at ${sha}.`);
}

function clipCommandOutput(text) {
  const value = typeof text === 'string' ? text : '';
  return value.length > 500 ? value.slice(0, 500) : value;
}

if (require.main === module) {
  main();
}
