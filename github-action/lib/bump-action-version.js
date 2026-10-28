'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const IMAGE = 'docker://asyncapi/github-action-for-cli:';
const PLACEHOLDER = '${ version }';
const INPUTS = ['cli_version', 'command', 'filepath', 'template', 'language', 'output', 'parameters', 'custom_command'];
const ROOT = path.resolve(__dirname, '../..');

function stableVersion(value) {
  if (typeof value !== 'string' || value.length > 64 || !(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/).test(value) ||
    value.split('.').some(part => !Number.isSafeInteger(Number(part)))) {
    throw new Error('The Docker action requires a canonical stable CLI version.');
  }
  return value;
}

function parseAction(text, template = false) {
  const yaml = require('js-yaml');
  const action = yaml.load(text, { schema: yaml.JSON_SCHEMA });
  if (!action || typeof action !== 'object' || Array.isArray(action) || action.runs?.using !== 'docker' ||
    typeof action.runs?.image !== 'string' || !action.inputs || typeof action.inputs !== 'object') {
    throw new Error('Invalid Docker action metadata.');
  }
  assert.deepEqual(Object.keys(action.inputs), INPUTS, 'The action input contract changed.');
  assert.deepEqual(action.runs.args, INPUTS.map(input => `\${{ inputs.${ input } }}`), 'The action argument contract changed.');
  if (template) {
    if (action.runs.image !== IMAGE + PLACEHOLDER || text.split(PLACEHOLDER).length !== 2) {
      throw new Error('The action template must contain exactly one version placeholder, in its Docker image.');
    }
  } else {
    if (!action.runs.image.startsWith(IMAGE)) {throw new Error('The action references an unexpected Docker image.');}
    stableVersion(action.runs.image.slice(IMAGE.length));
  }
  return action;
}

function renderAction(templateText, version) {
  stableVersion(version);
  parseAction(templateText, true);
  const rendered = templateText.replace(PLACEHOLDER, version);
  const action = parseAction(rendered);
  if (action.runs.image !== IMAGE + version) {throw new Error('The rendered action image does not match the CLI version.');}
  return rendered;
}

function validateActionBinding(root = ROOT, expectedVersion) {
  const version = stableVersion(expectedVersion || JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version);
  const templateText = fs.readFileSync(path.join(root, 'action-template.yml'), 'utf8');
  const currentText = fs.readFileSync(path.join(root, 'action.yml'), 'utf8');
  const current = parseAction(currentText);
  const expected = parseAction(renderAction(templateText, version));
  assert.deepEqual(current, expected, 'action.yml does not match the template and CLI version.');
  return { version, image: expected.runs.image };
}

function bumpActionVersion({ root = ROOT, previousVersion } = {}) {
  const version = stableVersion(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version);
  const outputPath = path.join(root, 'action.yml');
  const oldText = fs.readFileSync(outputPath, 'utf8');
  const template = fs.readFileSync(path.join(root, 'action-template.yml'), 'utf8');
  const current = parseAction(oldText);
  const previous = stableVersion(previousVersion || current.runs.image.slice(IMAGE.length));
  validateActionBinding(root, previous);
  const rendered = renderAction(template, version);
  const updated = parseAction(rendered);
  const oldContract = { ...current, runs: { ...current.runs, image: updated.runs.image } };
  assert.deepEqual(updated, oldContract, 'Versioning must preserve the complete action contract.');
  if (version === previous) {return { changed: false, version };}
  const oldParts = previous.split('.').map(Number);
  const newParts = version.split('.').map(Number);
  const firstDifference = oldParts.findIndex((part, index) => part !== newParts[index]);
  if (firstDifference < 0 || newParts[firstDifference] < oldParts[firstDifference]) {throw new Error('Refusing to downgrade the Docker action.');}
  const temporary = `${outputPath }.version-tmp`;
  let created = false;
  try {
    fs.writeFileSync(temporary, rendered, { flag: 'wx' });
    created = true;
    fs.renameSync(temporary, outputPath);
  } finally {
    if (created && fs.existsSync(temporary)) {fs.unlinkSync(temporary);}
  }
  validateActionBinding(root, version);
  return { changed: true, version };
}

function npmCli() {
  const binary = path.dirname(process.execPath);
  const candidates = [
    path.resolve(binary, '../lib/node_modules/npm/bin/npm-cli.js'),
    path.join(binary, 'node_modules/npm/bin/npm-cli.js'),
  ];
  const homebrew = process.execPath.match(/^(\/opt\/homebrew|\/usr\/local)\/Cellar\//);
  if (homebrew) {
    candidates.push(`${homebrew[1]}/lib/node_modules/npm/bin/npm-cli.js`);
  }
  if (binary === '/usr/bin') {
    candidates.push('/usr/share/nodejs/npm/bin/npm-cli.js');
  }
  const cli = candidates.find((file) => fs.existsSync(file));
  if (!cli) {
    throw new Error('Use a Node installation with bundled npm 11.5.1 or newer.');
  }
  return cli;
}

function refreshLock(root = ROOT, env = process.env) {
  const { spawnSync } = require('node:child_process');
  // npm run prepends project binaries to PATH; use the Node installation's npm.
  const result = spawnSync(process.execPath, [npmCli(), 'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'],
    { cwd: root, env, stdio: 'inherit', timeout: 180000 });
  if (result.error || result.signal || result.status !== 0) { throw new Error('Version lockfile refresh failed.'); }
}

module.exports = { INPUTS, IMAGE, stableVersion, parseAction, renderAction, validateActionBinding, bumpActionVersion, refreshLock };
if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args.length === 1 && !['--check', '--refresh-lock'].includes(args[0]))) {throw new Error('Usage: node bump-action-version.js [--check | --refresh-lock]');}
    const result = args.includes('--check') ? validateActionBinding() : bumpActionVersion();
    if (args.includes('--refresh-lock')) { refreshLock(); }
    console.log(JSON.stringify(result));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
