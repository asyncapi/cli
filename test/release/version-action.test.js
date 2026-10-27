'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fixture, ROOT } = require('./fixtures');
const {
  stableVersion,
  bumpActionVersion,
  validateActionBinding,
  refreshLock,
} = require('../../github-action/lib/bump-action-version');

test('action image matches the current CLI version', () => {
  const version = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'package.json')),
  ).version;
  assert.equal(validateActionBinding().version, version);
});

test('action bump changes only its image version and rejects downgrade or invalid stable versions', (t) => {
  const repo = fixture(t);
  const before = fs.readFileSync(path.join(repo.root, 'action.yml'), 'utf8');
  const pkg = JSON.parse(fs.readFileSync(path.join(repo.root, 'package.json')));

  pkg.version = '6.2.2';
  fs.writeFileSync(path.join(repo.root, 'package.json'), JSON.stringify(pkg));
  bumpActionVersion({ root: repo.root });

  assert.equal(
    fs.readFileSync(path.join(repo.root, 'action.yml'), 'utf8'),
    before.replace(
      'github-action-for-cli:6.2.1',
      'github-action-for-cli:6.2.2',
    ),
  );

  pkg.version = '6.2.0';
  fs.writeFileSync(path.join(repo.root, 'package.json'), JSON.stringify(pkg));
  assert.throws(() => bumpActionVersion({ root: repo.root }), /downgrade/);

  for (const invalid of [
    '01.2.3',
    '1.2',
    '1.2.3-beta.1',
    '1.2.3;echo unsafe',
  ]) {
    assert.throws(() => stableVersion(invalid));
  }
});

const cases = [
  [
    'CLI patch',
    { '@asyncapi/cli': 'patch' },
    ['6.2.2', '0.6.0', '2.0.0', '1.1.0'],
  ],
  [
    'diff patch',
    { '@asyncapi/diff': 'patch' },
    ['6.2.1', '0.6.1', '2.0.0', '1.1.0'],
  ],
  [
    'optimizer minor',
    { '@asyncapi/optimizer': 'minor' },
    ['6.2.1', '0.6.0', '2.1.0', '1.1.0'],
  ],
  [
    'bundler minor',
    { '@asyncapi/bundler': 'minor' },
    ['6.2.1', '0.6.0', '2.0.0', '1.2.0'],
  ],
  [
    'all packages',
    {
      '@asyncapi/cli': 'patch',
      '@asyncapi/diff': 'patch',
      '@asyncapi/optimizer': 'patch',
      '@asyncapi/bundler': 'patch',
    },
    ['6.2.2', '0.6.1', '2.0.1', '1.1.1'],
  ],
  [
    'diff major',
    { '@asyncapi/diff': 'major' },
    ['6.2.2', '1.0.0', '2.0.0', '1.1.0'],
  ],
  [
    'optimizer major',
    { '@asyncapi/optimizer': 'major' },
    ['6.2.2', '0.6.0', '3.0.0', '1.1.0'],
  ],
  [
    'bundler major',
    { '@asyncapi/bundler': 'major' },
    ['6.2.2', '0.6.0', '2.0.0', '2.0.0'],
  ],
];

for (const [name, change, expected] of cases) {
  test(
    `real Changesets versioning and npm lock refresh: ${name}`,
    { timeout: 240000 },
    (t) => {
      const repo = fixture(t, change);
      fs.symlinkSync(
        path.join(ROOT, 'node_modules'),
        path.join(repo.root, 'node_modules'),
        'junction',
      );
      const before = fs.readFileSync(
        path.join(repo.root, 'action.yml'),
        'utf8',
      );

      repo.run(process.execPath, [
        path.join(ROOT, 'node_modules/@changesets/cli/bin.js'),
        'version',
      ]);
      bumpActionVersion({ root: repo.root });
      refreshLock(repo.root, repo.env);

      const files = [
        'package.json',
        'packages/diff/package.json',
        'packages/optimizer/package.json',
        'packages/bundler/package.json',
      ];
      assert.deepEqual(
        files.map(
          (file) =>
            JSON.parse(fs.readFileSync(path.join(repo.root, file))).version,
        ),
        expected,
      );
      const lock = JSON.parse(
        fs.readFileSync(path.join(repo.root, 'package-lock.json')),
      );
      assert.deepEqual(
        ['', 'packages/diff', 'packages/optimizer', 'packages/bundler'].map(
          (dir) => lock.packages[dir].version,
        ),
        expected,
      );
      const cli = JSON.parse(
        fs.readFileSync(path.join(repo.root, 'package.json')),
      );
      assert.deepEqual(lock.packages[''].dependencies, cli.dependencies);
      const semver = require('semver');
      assert.ok(
        semver.satisfies(expected[1], cli.dependencies['@asyncapi/diff']),
      );
      assert.ok(
        semver.satisfies(expected[2], cli.dependencies['@asyncapi/optimizer']),
      );
      assert.ok(
        semver.satisfies(expected[3], cli.dependencies['@asyncapi/bundler']),
      );
      assert.equal(
        fs.existsSync(path.join(repo.root, '.changeset/testing.md')),
        false,
      );
      validateActionBinding(repo.root, expected[0]);
      if (expected[0] === '6.2.1') {
        assert.equal(
          fs.readFileSync(path.join(repo.root, 'action.yml'), 'utf8'),
          before,
        );
      }
    },
  );
}
