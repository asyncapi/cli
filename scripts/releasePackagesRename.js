/* eslint-disable @typescript-eslint/no-var-requires */

const { rename, access } = require('fs').promises;
const packageJson = require('../package.json');
const path = require('path');
const simpleGit = require('simple-git');
const git = simpleGit({baseDir: process.cwd()});

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch (e) {
    return false;
  }
}

async function renameDeb({version, name, sha}) {
  const dist = 'dist/deb';

  // deb package naming convention: https://github.com/oclif/oclif/blob/fb5da961f925fa0eba5c5b05c8cee0c9bd156c00/src/upload-util.ts#L51
  const generatedPath = path.resolve(dist, `${name}_${version}.${sha}-1_amd64.deb`);
  const newPath = path.resolve(dist, 'asyncapi.deb');
  if (await fileExists(generatedPath)) { 
    await rename(generatedPath, newPath);
  }
}

async function renamePkg({version, name, sha}) {
  const dist = 'dist/macos';

  const generatedPath = path.resolve(dist, `${name}-v${version}-${sha}.pkg`);
  const newPath = path.resolve(dist, 'asyncapi.pkg');
  if (await fileExists(generatedPath)) { 
    await rename(generatedPath, newPath);
  }
}

async function renamePackages() {
  const version = packageJson.version;
  const name = 'asyncapi';
  const sha = await git.revparse(['--short', 'HEAD']);
  await renameDeb({version: version.split('-')[0], name, sha});
  await renamePkg({version, name, sha});
}

renamePackages();
