'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '../..');

function fixture(t, changeset) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-release-test-'));
  const root = path.join(parent, 'repo');
  fs.mkdirSync(root);
  t.after(() => fs.rmSync(parent, { recursive: true, force: true }));

  const packages = [
    [
      'package.json',
      {
        name: '@asyncapi/cli',
        version: '6.2.1',
        workspaces: ['.', 'packages/*'],
        dependencies: {
          '@asyncapi/diff': '^0.6.0',
          '@asyncapi/optimizer': '^2.0.0',
          '@asyncapi/bundler': '^1.1.0',
        },
        devDependencies: {
          '@changesets/cli': '2.29.8',
          '@changesets/changelog-git': '0.2.1',
        },
      },
    ],
    [
      'packages/diff/package.json',
      { name: '@asyncapi/diff', version: '0.6.0' },
    ],
    [
      'packages/optimizer/package.json',
      { name: '@asyncapi/optimizer', version: '2.0.0' },
    ],
    [
      'packages/bundler/package.json',
      { name: '@asyncapi/bundler', version: '1.1.0' },
    ],
  ];

  for (const [file, data] of packages) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(
      path.join(root, file),
      `${JSON.stringify(data, null, 2)}\n`,
    );
    fs.writeFileSync(
      path.join(root, path.dirname(file), 'index.js'),
      'module.exports = 1;\n',
    );
  }

  const template = fs.readFileSync(
    path.join(ROOT, 'action-template.yml'),
    'utf8',
  );
  fs.writeFileSync(path.join(root, 'action-template.yml'), template);
  fs.writeFileSync(
    path.join(root, 'action.yml'),
    template.replace('${ version }', packages[0][1].version),
  );
  fs.mkdirSync(path.join(root, '.changeset'));
  fs.copyFileSync(
    path.join(ROOT, '.changeset/config.json'),
    path.join(root, '.changeset/config.json'),
  );
  if (changeset) {
    fs.writeFileSync(
      path.join(root, '.changeset/testing.md'),
      `---\n${Object.entries(changeset)
        .map(([name, type]) => `"${name}": ${type}`)
        .join('\n')}\n---\n\nRelease test.\n`,
    );
  }

  fs.writeFileSync(path.join(root, '.gitignore'), 'node_modules\n');
  const env = Object.fromEntries(
    ['PATH', 'SystemRoot', 'SYSTEMROOT', 'COMSPEC', 'TMP', 'TEMP', 'TMPDIR']
      .filter((key) => process.env[key])
      .map((key) => [key, process.env[key]]),
  );
  env.HOME = parent;

  const run = (command, args) => {
    const result = spawnSync(command, args, {
      cwd: root,
      env,
      encoding: 'utf8',
      timeout: 180000,
      maxBuffer: 1024 * 1024,
    });
    assert.equal(
      result.status,
      0,
      `${command} ${args[0]} failed: ${result.stderr}`,
    );
    return result.stdout.trim();
  };

  run('git', ['init', '-b', 'master']);
  run('git', ['config', 'user.name', 'Release test']);
  run('git', ['config', 'user.email', 'release-test@example.com']);
  run('git', ['add', '.']);
  run('git', ['commit', '-m', 'Test source']);
  const sha = run('git', ['rev-parse', 'HEAD']);
  const workflowEnv = {
    ...env,
    GITHUB_ACTIONS: 'true',
    GITHUB_REPOSITORY: 'asyncapi/cli',
    GITHUB_REF: 'refs/heads/master',
    GITHUB_EVENT_NAME: 'push',
    GITHUB_SHA: sha,
  };

  return { root, parent, run, env, workflowEnv, sha };
}

module.exports = { fixture, ROOT };
