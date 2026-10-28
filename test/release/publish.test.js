'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fixture } = require('./fixtures');
const {
  inventory,
  adapter,
  pack,
  publish,
  releases,
  integrity,
  context,
} = require('../../scripts/publish-trusted');

function packed(t) {
  const release = fixture(t);
  const directory = path.join(release.parent, 'artifacts');
  fs.mkdirSync(directory);
  const packages = inventory(release.root).map((pkg, index) => {
    const tarball = `package-${index}.tgz`;
    fs.writeFileSync(path.join(directory, tarball), `built ${pkg.name}`);
    return {
      ...pkg,
      tarball,
      published: null,
      integrity: integrity(path.join(directory, tarball)),
    };
  });
  fs.writeFileSync(
    path.join(directory, 'manifest.json'),
    JSON.stringify({ sourceSha: release.sha, packages }),
  );
  const records = new Map();
  const events = [];
  const client = {
    env: {
      ...release.workflowEnv,
      ACTIONS_ID_TOKEN_REQUEST_URL: 'https://oidc.example',
      ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'test-oidc',
    },
    head: () => release.sha,
    clean() {},
    verifyTarball() {},
    registry: (pkg) => records.get(pkg.name) || null,
    latest: () => undefined,
    publish(file) {
      const pkg = packages.find(
        (candidate) => path.basename(file) === candidate.tarball,
      );
      events.push(`npm:${pkg.name}`);
      records.set(pkg.name, { gitHead: release.sha, integrity: pkg.integrity });
    },
    latestRelease: () => undefined,
    tagTarget: () => undefined,
    release: () => undefined,
    createTag: (tag) => events.push(`tag:${tag}`),
    createRelease: (pkg, latest) => events.push(`release:${pkg.tag}:${latest}`),
  };
  return { ...release, directory, packages, records, events, client };
}

function githubMode(release) {
  release.client.env = { ...release.workflowEnv, GH_TOKEN: 'test-github' };
}

test('all packages publish before GitHub release creation; libraries never become Latest', async (t) => {
  const release = packed(t);
  await publish(release.root, release.directory, release.client);
  assert.deepEqual(release.events, [
    'npm:@asyncapi/diff',
    'npm:@asyncapi/optimizer',
    'npm:@asyncapi/bundler',
    'npm:@asyncapi/cli',
  ]);
  githubMode(release);
  releases(release.root, release.directory, release.client);
  assert.deepEqual(release.events.slice(4), [
    'tag:@asyncapi/diff@0.6.0',
    'release:@asyncapi/diff@0.6.0:false',
    'tag:@asyncapi/optimizer@2.0.0',
    'release:@asyncapi/optimizer@2.0.0:false',
    'tag:@asyncapi/bundler@1.1.0',
    'release:@asyncapi/bundler@1.1.0:false',
    'tag:v6.2.1',
    'release:v6.2.1:true',
  ]);
});

test('partial npm publication retries only missing packages and no release can precede completion', async (t) => {
  const release = packed(t);
  const realPublish = release.client.publish;
  release.client.publish = (file) => {
    if (path.basename(file) === release.packages[1].tarball) {
      throw new Error('npm outage');
    }
    realPublish(file);
  };
  await assert.rejects(
    () => publish(release.root, release.directory, release.client),
    /outage/,
  );
  assert.ok(release.records.has(release.packages[2].name));
  assert.equal(release.records.has(release.packages[3].name), false);
  githubMode(release);
  assert.throws(
    () => releases(release.root, release.directory, release.client),
    /incomplete/,
  );
  assert.equal(
    release.events.some((event) => event.startsWith('tag:')),
    false,
  );
  release.client.publish = realPublish;
  release.client.env = {
    ...release.workflowEnv,
    ACTIONS_ID_TOKEN_REQUEST_URL: 'url',
    ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'oidc',
  };
  await publish(release.root, release.directory, release.client);
  assert.equal(
    release.events.filter((event) => event === 'npm:@asyncapi/diff').length,
    1,
  );
});

test('tampered artifacts, conflicting npm identities and newer npm Latest stop before publishing', async (t) => {
  for (const problem of ['tarball', 'source', 'newer']) {
    const release = packed(t);
    if (problem === 'tarball') {
      fs.appendFileSync(
        path.join(release.directory, release.packages[2].tarball),
        'tamper',
      );
    }
    if (problem === 'source') {
      release.records.set(release.packages[2].name, {
        gitHead: 'a'.repeat(40),
        integrity: release.packages[2].integrity,
      });
    }
    if (problem === 'newer') {
      release.client.latest = () => '99.0.0';
    }
    await assert.rejects(
      () => publish(release.root, release.directory, release.client),
    );
    assert.equal(release.events.length, 0);
  }
});

test('delayed npm visibility is retried without publishing the package again', async (t) => {
  const release = packed(t);
  const registry = release.client.registry;
  // Registry visibility can lag beyond the original 30-second retry window.
  let missingReads = 8;
  release.client.registry = (pkg) => {
    const current = registry(pkg);
    if (pkg.name === release.packages[0].name && current && missingReads-- > 0) {
      return null;
    }
    return current;
  };
  await publish(release.root, release.directory, release.client, async () => {});
  assert.equal(release.records.size, 4);
  assert.equal(release.events.length, 4);
});

test('unconfirmed npm publication fails after bounded retries and holds back the CLI', async (t) => {
  const release = packed(t);
  const registry = release.client.registry;
  let waits = 0;
  release.client.registry = (pkg) =>
    pkg.name === release.packages[0].name ? null : registry(pkg);
  await assert.rejects(
    () => publish(release.root, release.directory, release.client, async () => {
      waits++;
    }),
    /incomplete/,
  );
  assert.ok(waits > 0 && waits <= 24);
  assert.ok(release.records.has(release.packages[2].name));
  assert.equal(release.records.has(release.packages[3].name), false);
});

test('existing tags/releases are reused and conflicts cannot create any release', async (t) => {
  const release = packed(t);
  await publish(release.root, release.directory, release.client);
  release.events.length = 0;
  githubMode(release);
  release.client.tagTarget = () => release.sha;
  release.client.release = (tag) => ({
    tag_name: tag,
    draft: false,
    prerelease: false,
  });
  releases(release.root, release.directory, release.client);
  assert.equal(release.events.length, 0);
  release.client.tagTarget = () => 'a'.repeat(40);
  assert.throws(
    () => releases(release.root, release.directory, release.client),
    /tag/,
  );
  assert.equal(release.events.length, 0);
});

test('older CLI recovery cannot trigger delivery and missing historical tags require review', async (t) => {
  const release = packed(t);
  await publish(release.root, release.directory, release.client);
  release.events.length = 0;
  githubMode(release);
  release.client.latestRelease = () => ({
    tag_name: 'v7.0.0',
    draft: false,
    prerelease: false,
  });
  assert.throws(
    () => releases(release.root, release.directory, release.client),
    /older CLI/,
  );
  assert.equal(release.events.length, 0);
  release.client.latestRelease = () => undefined;
  const manifest = JSON.parse(
    fs.readFileSync(path.join(release.directory, 'manifest.json')),
  );
  manifest.packages[0].published = {
    gitHead: 'a'.repeat(40),
    integrity: release.packages[0].integrity,
  };
  release.records.set(
    manifest.packages[0].name,
    manifest.packages[0].published,
  );
  fs.writeFileSync(
    path.join(release.directory, 'manifest.json'),
    JSON.stringify(manifest),
  );
  assert.throws(
    () => releases(release.root, release.directory, release.client),
    /historical/,
  );
  assert.equal(release.events.length, 0);
});

test('publisher and GitHub token contexts cannot overlap or run from an unverified source', (t) => {
  const release = packed(t);
  for (const override of [
    { GH_TOKEN: 'wrong-job' },
    { GITHUB_REF: 'refs/heads/beta' },
    { GITHUB_REPOSITORY: 'fork/cli' },
    { GITHUB_SHA: 'a'.repeat(40) },
    { NPM_TOKEN: 'long-lived' },
  ]) {
    assert.throws(() =>
      context(
        { ...release.client, env: { ...release.client.env, ...override } },
        '--publish',
        release.sha,
      ),
    );
  }
  githubMode(release);
  assert.throws(() =>
    context(
      {
        ...release.client,
        env: {
          ...release.client.env,
          ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'wrong-job',
        },
      },
      '--releases',
      release.sha,
    ),
  );
});

test('registry errors fail closed; only E404 means unpublished', (t) => {
  const release = fixture(t);
  const pkg = inventory(release.root)[0];
  for (const code of ['E404', 'E503', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE']) {
    const client = adapter(
      release.root,
      release.workflowEnv,
      (_command, args) =>
        args.includes('--version')
          ? { status: 0, stdout: '11.6.2\n' }
          : { status: 1, stdout: JSON.stringify({ error: { code } }) },
    );
    if (code === 'E404') {
      assert.equal(client.registry(pkg), null);
    } else {
      assert.throws(() => client.registry(pkg));
    }
  }
});

test('npm publication retains public provenance context and only its OIDC credentials', (t) => {
  const release = fixture(t);
  const calls = [];
  const provenance = {
    ...release.workflowEnv,
    CI: 'true',
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_REPOSITORY_ID: '123',
    GITHUB_REPOSITORY_OWNER_ID: '456',
    GITHUB_WORKFLOW_REF:
      'asyncapi/cli/.github/workflows/release-with-changesets.yml@refs/heads/master',
    GITHUB_RUN_ID: '789',
    GITHUB_RUN_ATTEMPT: '1',
    RUNNER_ENVIRONMENT: 'github-hosted',
  };
  const env = {
    ...provenance,
    ACTIONS_ID_TOKEN_REQUEST_URL: 'https://oidc.example',
    ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'test-oidc',
    GH_TOKEN: 'unrelated-github',
    GITHUB_TOKEN: 'unrelated-github',
    NPM_TOKEN: 'unrelated-npm',
    NODE_AUTH_TOKEN: 'unrelated-npm',
    NODE_OPTIONS: '--require=untrusted.js',
  };
  const client = adapter(release.root, env, (_command, args, options) => {
    calls.push({ args, env: options.env });
    return { status: 0, stdout: args.includes('--version') ? '11.6.2' : '{}' };
  });
  client.publish(path.join(release.parent, 'package.tgz'));
  const publication = calls.find((call) => call.args.includes('publish'));
  for (const [key, value] of Object.entries(provenance)) {
    assert.equal(publication.env[key], value);
  }
  assert.equal(publication.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN, 'test-oidc');
  assert.equal(
    publication.env.ACTIONS_ID_TOKEN_REQUEST_URL,
    'https://oidc.example',
  );
  for (const call of calls) {
    for (const key of [
      'GH_TOKEN',
      'GITHUB_TOKEN',
      'NPM_TOKEN',
      'NODE_AUTH_TOKEN',
      'NODE_OPTIONS',
    ]) {
      assert.equal(call.env[key], undefined);
    }
    if (!call.args.includes('publish')) {
      assert.equal(call.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN, undefined);
    }
  }
});

test('real npm pack disables hooks, embeds the source commit and restores package bytes', (t) => {
  const release = fixture(t);
  const pkg = inventory(release.root).at(-1);
  const file = path.join(release.root, 'package.json');
  const data = JSON.parse(fs.readFileSync(file));
  data.scripts = { prepare: 'exit 99', prepack: 'exit 99' };
  const original = `${JSON.stringify(data)}\n`;
  fs.writeFileSync(file, original);
  const directory = path.join(release.parent, 'packed');
  fs.mkdirSync(directory);
  const client = adapter(release.root, release.workflowEnv);
  const name = client.pack(pkg, release.sha, directory);
  client.verifyTarball(path.join(directory, name), pkg, release.sha);
  assert.equal(fs.readFileSync(file, 'utf8'), original);
});

test('real tarballs cannot override the publishing registry, TLS settings or public access', (t) => {
  const release = fixture(t);
  const pkg = inventory(release.root).at(-1);
  const file = path.join(release.root, 'package.json');
  const original = JSON.parse(fs.readFileSync(file));
  const directory = path.join(release.parent, 'packed');
  fs.mkdirSync(directory);
  const client = adapter(release.root, release.workflowEnv);
  for (const config of [
    { '@asyncapi:registry': 'https://untrusted.example' },
    { 'strict-ssl': false },
    { access: 'restricted' },
    { registry: 'https://untrusted.example' },
  ]) {
    fs.writeFileSync(
      file,
      JSON.stringify({ ...original, publishConfig: config }),
    );
    const name = client.pack(pkg, release.sha, directory);
    assert.throws(
      () => client.verifyTarball(path.join(directory, name), pkg, release.sha),
      /publishConfig/,
    );
  }
});

test('packing failure restores package bytes and credential-free packing rejects dirty source', (t) => {
  const release = fixture(t);
  const pkg = inventory(release.root)[0];
  const file = path.join(release.root, pkg.file);
  const original = fs.readFileSync(file);
  const client = adapter(release.root, release.workflowEnv, (_command, args) =>
    args.includes('--version')
      ? { status: 0, stdout: '11.6.2' }
      : { status: 1, stdout: '' },
  );
  assert.throws(() => client.pack(pkg, release.sha, release.parent));
  assert.deepEqual(fs.readFileSync(file), original);
  const realClient = adapter(release.root, release.workflowEnv);
  fs.appendFileSync(file, '\n');
  assert.throws(() =>
    pack(release.root, path.join(release.parent, 'pack'), realClient),
  );
});
