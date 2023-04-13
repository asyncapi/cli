/* eslint-disable @typescript-eslint/no-var-requires */

const { rename, access, mkdir } = require('fs').promises;
const packageJson = require('../package.json');
const path = require('path');
const simpleGit = require('simple-git');
const git = simpleGit({baseDir: process.cwd()});

async function fileExists(checkPath) {
  try {
    await access(checkPath);
    return true;
  } catch (e) {
    return false;
  }
}

async function checkAndRenameFile(generatedPath, newPath) {
  if (await fileExists(generatedPath)) {
    await rename(generatedPath, newPath);
  }
}

async function createDirectory(directoryPath) {
  await mkdir(directoryPath);
}

async function renameDeb({version, name, sha}) {
  const dist = 'dist/deb';

  // deb package naming convention: https://github.com/oclif/oclif/blob/fb5da961f925fa0eba5c5b05c8cee0c9bd156c00/src/upload-util.ts#L51
  const generatedPath = path.resolve(dist, `${name}_${version}.${sha}-1_amd64.deb`);
  const newPath = path.resolve(dist, 'asyncapi.deb');
  await checkAndRenameFile(generatedPath, newPath);
}

async function renameTar({version, name, sha}) {
  const dist = 'dist';

  const generatedPath = path.resolve(dist, `${name}-v${version}-${sha}-linux-x64.tar.gz`);
  // for tarballs, the files are generated in `dist/` directory.
  // Creates a new `tar` directory(`dist/tar`), and moves the generated tarball inside that directory.
  const tarDirectory = path.resolve(dist, 'tar');
  await createDirectory(tarDirectory);
  const newPath = path.resolve(tarDirectory, 'asyncapi.tar.gz');
  await checkAndRenameFile(generatedPath, newPath);
}

async function renamePkg({version, name, sha}) {
  const dist = 'dist/macos';

  const generatedPath = path.resolve(dist, `${name}-v${version}-${sha}-arm64.pkg`);
  const newPath = path.resolve(dist, 'asyncapi.arm64.pkg');
  await checkAndRenameFile(generatedPath, newPath);

  const generatedPath = path.resolve(dist, `${name}-v${version}-${sha}-x64.pkg`);
  const newPath = path.resolve(dist, 'asyncapi.x64.pkg');
  await checkAndRenameFile(generatedPath, newPath);
}

async function renamePackages() {
  const version = packageJson.version;
  const name = 'asyncapi';
  const sha = await git.revparse(['--short', 'HEAD']);
  await renameDeb({version: version.split('-')[0], name, sha});
  await renamePkg({version, name, sha});
  await renameTar({version, name, sha});
}

renamePackages();
