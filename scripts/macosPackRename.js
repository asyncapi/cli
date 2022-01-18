/* eslint-disable @typescript-eslint/no-var-requires */

const { rename } = require('fs').promises;
const packageJson = require('../package.json');
const path = require('path');
const simpleGit = require('simple-git');
const git = simpleGit({baseDir: process.cwd()});

async function renamePkg() {
  const version = packageJson.version;
  const name = 'asyncapi';
  const sha = await git.revparse(['--short', 'HEAD']);
  const dist = 'dist/macos';

  const generatedPkgPath = path.resolve(dist, `${name}-v${version}-${sha}.pkg`);
  const newPath = path.resolve(dist, 'asyncapi.pkg');
  await rename(generatedPkgPath, newPath);
}

renamePkg();
