/* eslint-disable @typescript-eslint/no-var-requires */

const { rename } = require('fs').promises;
const packageJson = require('../package.json');
const path = require('path');
const simpleGit = require('simple-git');
const git = simpleGit({baseDir: process.cwd()});

async function renameDeb() {
  const version = packageJson.version.split('-')[0];
  const name = 'asyncapi';
  const sha = await git.revparse(['--short', 'HEAD']);
  const dist = 'dist/deb';

  // deb package naming convention: https://github.com/oclif/oclif/blob/fb5da961f925fa0eba5c5b05c8cee0c9bd156c00/src/upload-util.ts#L51
  const generatedDebPath = path.resolve(dist, `${name}_${version}.${sha}-1_amd64.deb`);
  const newPath = path.resolve(dist, 'asyncapi.deb');
  await rename(generatedDebPath, newPath);
}

renameDeb();
