'use strict';

// Keep version PRs in changesets/action. This helper only moves built packages
// through credential-free packing, npm OIDC publication and GitHub releases.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const REPOSITORY = 'asyncapi/cli';
const REGISTRY = 'https://registry.npmjs.org';
// Publish independent libraries first; the CLI depends on all three.
const WORKSPACES = [
  {
    file: 'packages/diff/package.json',
    name: '@asyncapi/diff',
  },
  {
    file: 'packages/optimizer/package.json',
    name: '@asyncapi/optimizer',
  },
  {
    file: 'packages/bundler/package.json',
    name: '@asyncapi/bundler',
  },
  { file: 'package.json', name: '@asyncapi/cli' },
];
const ROOT = path.resolve(__dirname, '..');
const SHA = /^[a-f0-9]{40}$/;
const INTEGRITY = /^sha512-[A-Za-z0-9+/]{86}==$/;

function stableVersion(value) {
  if (
    typeof value !== 'string' ||
    !(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/).test(value) ||
    value.length > 64 ||
    value.split('.').some((part) => !Number.isSafeInteger(Number(part)))
  ) {
    throw new Error('Only canonical stable versions are supported by the master release workflow.');
  }
  return value;
}

function compareVersions(left, right) {
  const a = stableVersion(left).split('.').map(Number);
  const b = stableVersion(right).split('.').map(Number);
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

function inventory(root) {
  return WORKSPACES.map(({ file, name }) => {
    const data = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    if (data.name !== name || data.private === true) {
      throw new Error('Release workspace inventory changed; update its policy explicitly.');
    }
    return {
      name: data.name,
      version: stableVersion(data.version),
      file,
      tag: file === 'package.json' ? `v${data.version}` : `${data.name}@${data.version}`,
    };
  });
}

function integrity(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size === 0 || stat.size > 200 * 1024 * 1024) {
    throw new Error('Invalid release tarball.');
  }
  return `sha512-${crypto.createHash('sha512').update(fs.readFileSync(file)).digest('base64')}`;
}

function tarballPath(directory, name) {
  if (typeof name !== 'string' || !(/^[a-z0-9][a-z0-9.-]*\.tgz$/).test(name)) {
    throw new Error('Invalid release tarball path.');
  }
  return path.join(directory, name);
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

function adapter(root = ROOT, env = process.env, runner = spawnSync) {
  // Child commands receive only runtime/provenance fields, then their own credential.
  const allowedEnvironment = [
    'PATH',
    'HOME',
    'TMPDIR',
    'TMP',
    'TEMP',
    'SystemRoot',
    'SYSTEMROOT',
    'COMSPEC',
    'USERPROFILE',
    'APPDATA',
    'LOCALAPPDATA',
    'LANG',
    'LC_ALL',
    'NODE_EXTRA_CA_CERTS',
    'NODE_USE_SYSTEM_CA',
    'SSL_CERT_FILE',
    'SSL_CERT_DIR',
    'HTTPS_PROXY',
    'HTTP_PROXY',
    'NO_PROXY',
    // npm detects GitHub Actions and builds provenance from these public fields.
    'CI',
    'GITHUB_ACTIONS',
    'GITHUB_EVENT_NAME',
    'GITHUB_REPOSITORY',
    'GITHUB_REPOSITORY_ID',
    'GITHUB_REPOSITORY_OWNER_ID',
    'GITHUB_REF',
    'GITHUB_SHA',
    'GITHUB_SERVER_URL',
    'GITHUB_WORKFLOW_REF',
    'GITHUB_RUN_ID',
    'GITHUB_RUN_ATTEMPT',
    'RUNNER_ENVIRONMENT',
  ];
  const commandEnv = Object.fromEntries(
    allowedEnvironment.filter((key) => env[key] !== undefined).map((key) => [key, env[key]])
  );
  const runCommand = (command, args, childEnv = commandEnv, cwd = root) =>
    runner(command, args, {
      cwd,
      env: childEnv,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 180000,
      maxBuffer: 1024 * 1024,
    });
  const requireSuccess = (result) => {
    if (result.error || result.signal || result.status !== 0) {
      throw new Error('Release command failed; no successful result can be assumed.');
    }
    return result.stdout;
  };
  const runGit = (args) => requireSuccess(runCommand('git', args)).trim();

  // Run npm outside the checkout with empty config files and lifecycle hooks disabled.
  let checkedNpm = false;
  const runNpm = (args, publish = false) => {
    const cli = npmCli();
    if (!checkedNpm) {
      const version = requireSuccess(runCommand(process.execPath, [cli, '--version'])).trim();
      if (compareVersions(version, '11.5.1') < 0) {
        throw new Error('npm 11.5.1 or newer is required.');
      }
      checkedNpm = true;
    }
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-release-npm-'));
    try {
      const userConfig = path.join(temporary, 'user.npmrc');
      const globalConfig = path.join(temporary, 'global.npmrc');
      fs.writeFileSync(userConfig, '');
      fs.writeFileSync(globalConfig, '');
      const childEnv = { ...commandEnv };
      if (publish) {
        childEnv.ACTIONS_ID_TOKEN_REQUEST_URL = env.ACTIONS_ID_TOKEN_REQUEST_URL;
        childEnv.ACTIONS_ID_TOKEN_REQUEST_TOKEN = env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
      }
      return runCommand(
        process.execPath,
        [
          cli,
          ...args,
          '--registry',
          REGISTRY,
          '--ignore-scripts',
          '--userconfig',
          userConfig,
          '--globalconfig',
          globalConfig,
        ],
        childEnv,
        temporary
      );
    } finally {
      fs.rmSync(temporary, { recursive: true, force: true });
    }
  };
  const githubApi = (endpoint, args = []) => {
    const result = runCommand(
      'gh',
      ['api', '--method', args.length ? 'POST' : 'GET', `repos/${REPOSITORY}/${endpoint}`, ...args],
      { ...commandEnv, GH_TOKEN: env.GH_TOKEN }
    );
    if (
      !args.length &&
      !result.error &&
      !result.signal &&
      result.status !== 0 &&
      (/\(HTTP 404\)/).test(result.stderr || '')
    ) {
      return undefined;
    }
    return JSON.parse(requireSuccess(result));
  };
  return {
    env,
    head: () => runGit(['rev-parse', 'HEAD']),
    clean: () => {
      runGit(['diff', '--exit-code', 'HEAD']);
      if (runGit(['status', '--porcelain', '--untracked-files=all'])) {
        throw new Error('Release packing requires a clean source checkout.');
      }
    },
    // npm metadata, built tarballs and OIDC publication.
    registry(pkg) {
      const result = runNpm(['view', `${pkg.name}@${pkg.version}`, '--json', '--prefer-online']);
      let data;
      try {
        data = JSON.parse(result.stdout);
      } catch {
        throw new Error('Unreadable npm response.');
      }
      if (!result.error && !result.signal && result.status !== 0 && data?.error?.code === 'E404') {
        return null;
      }
      requireSuccess(result);
      if (
        data.name !== pkg.name ||
        data.version !== pkg.version ||
        !SHA.test(data.gitHead || '') ||
        !INTEGRITY.test(data.dist?.integrity || '')
      ) {
        throw new Error('npm publication identity is missing or invalid.');
      }
      return { gitHead: data.gitHead, integrity: data.dist.integrity };
    },
    latest(pkg) {
      const result = runNpm(['view', pkg.name, 'dist-tags', '--json']);
      const data = JSON.parse(result.stdout);
      if (!result.error && !result.signal && result.status !== 0 && data?.error?.code === 'E404') {
        return undefined;
      }
      requireSuccess(result);
      return stableVersion(data.latest);
    },
    pack(pkg, sourceSha, directory) {
      const file = path.join(root, pkg.file);
      const original = fs.readFileSync(file);
      try {
        fs.writeFileSync(
          file,
          `${JSON.stringify({ ...JSON.parse(original), gitHead: sourceSha }, null, 2)}\n`
        );
        const packed = JSON.parse(
          requireSuccess(
            runNpm(['pack', path.dirname(file), '--json', '--pack-destination', directory])
          )
        );
        if (
          packed.length !== 1 ||
          packed[0].name !== pkg.name ||
          packed[0].version !== pkg.version
        ) {
          throw new Error('Unexpected packed package.');
        }
        return packed[0].filename;
      } finally {
        fs.writeFileSync(file, original);
      }
    },
    verifyTarball(file, pkg, sourceSha) {
      const data = JSON.parse(
        requireSuccess(runCommand('tar', ['-xOzf', file, 'package/package.json']))
      );
      if (
        data.name !== pkg.name ||
        data.version !== pkg.version ||
        data.gitHead !== sourceSha ||
        data.private === true
      ) {
        throw new Error('Packed package does not match its source identity.');
      }
      // npm accepts arbitrary npmrc settings here, including scoped registries.
      const config = data.publishConfig;
      if (
        config !== undefined &&
        (!config ||
          typeof config !== 'object' ||
          Array.isArray(config) ||
          Object.entries(config).some(
            ([key, value]) =>
              !(
                (key === 'access' && value === 'public') ||
                (key === 'registry' && value === REGISTRY)
              )
          ))
      ) {
        throw new Error(
          'Packed publishConfig may only select public access and the official npm registry.'
        );
      }
    },
    publish: (file) =>
      requireSuccess(
        runNpm(['publish', file, '--access', 'public', '--tag', 'latest', '--provenance'], true)
      ),
    // GitHub operations run later, with a separate token and no OIDC access.
    tagTarget(tag) {
      let object = githubApi(`git/ref/tags/${encodeURIComponent(tag)}`)?.object;
      for (let depth = 0; object?.type === 'tag'; depth++) {
        if (depth >= 5 || !SHA.test(object.sha || '')) {
          throw new Error('Invalid annotated release tag.');
        }
        object = githubApi(`git/tags/${object.sha}`)?.object;
      }
      if (object && (object.type !== 'commit' || !SHA.test(object.sha || ''))) {
        throw new Error('Invalid release tag target.');
      }
      return object?.sha;
    },
    release: (tag) => githubApi(`releases/tags/${encodeURIComponent(tag)}`),
    latestRelease: () => githubApi('releases/latest'),
    createTag: (tag, sha) =>
      githubApi('git/refs', ['-f', `ref=refs/tags/${tag}`, '-f', `sha=${sha}`]),
    createRelease(pkg, latest) {
      const args = [
        'release',
        'create',
        pkg.tag,
        '--repo',
        REPOSITORY,
        '--verify-tag',
        '--title',
        pkg.tag,
        `--latest=${latest}`,
      ];
      if (pkg.file === 'package.json') {
        args.push('--generate-notes');
      } else {
        args.push('--notes', `Release ${pkg.tag}.`);
      }
      requireSuccess(runCommand('gh', args, { ...commandEnv, GH_TOKEN: env.GH_TOKEN }));
    },
  };
}

function context(client, phase, sourceSha) {
  const env = client.env;
  if (
    !SHA.test(sourceSha || '') ||
    client.head() !== sourceSha ||
    env.GITHUB_SHA !== sourceSha ||
    env.GITHUB_ACTIONS !== 'true' ||
    env.GITHUB_REPOSITORY !== REPOSITORY ||
    env.GITHUB_REF !== 'refs/heads/master' ||
    !['push', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME)
  ) {
    throw new Error(
      'Release writes require the exact asyncapi/cli master workflow commit.'
    );
  }
  if (
    env.NPM_TOKEN ||
    env.NODE_AUTH_TOKEN ||
    (phase !== '--releases' && (env.GH_TOKEN || env.GITHUB_TOKEN))
  ) {
    throw new Error('Unexpected release credential.');
  }
  if (
    phase === '--publish' &&
    (!env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN)
  ) {
    throw new Error('npm publishing requires OIDC.');
  }
  if (phase !== '--publish' && env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
    throw new Error('OIDC belongs only in the npm publishing job.');
  }
  if (phase === '--releases' && !env.GH_TOKEN) {
    throw new Error('GH_TOKEN is required to create release events.');
  }
}

function readManifest(root, directory, client, phase) {
  const manifestPath = path.join(directory, 'manifest.json');
  if (fs.statSync(manifestPath).size > 1024 * 1024) {
    throw new Error('Release manifest exceeds its size limit.');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  context(client, phase, manifest.sourceSha);
  const packages = inventory(root);
  if (manifest.packages?.length !== packages.length) {
    throw new Error('Incomplete release artifact.');
  }
  for (const [index, pkg] of packages.entries()) {
    const record = manifest.packages[index];
    for (const key of ['name', 'version', 'file', 'tag']) {
      if (record[key] !== pkg[key]) {
        throw new Error('Release artifact inventory does not match the checkout.');
      }
    }
    if (
      !INTEGRITY.test(record.integrity || '') ||
      (record.published &&
        (!SHA.test(record.published.gitHead || '') ||
          !INTEGRITY.test(record.published.integrity || '')))
    ) {
      throw new Error('Invalid publication evidence in release manifest.');
    }
    const tarball = tarballPath(directory, record.tarball);
    if (integrity(tarball) !== record.integrity) {
      throw new Error('Release tarball integrity mismatch.');
    }
    client.verifyTarball(tarball, record, manifest.sourceSha);
  }
  return manifest;
}

function assertPublished(pkg, actual, sourceSha) {
  const expected = pkg.published || { gitHead: sourceSha, integrity: pkg.integrity };
  if (!actual) {
    throw new Error(`Publication is incomplete: ${pkg.name}@${pkg.version} is not visible on npm.`);
  }
  if (actual.gitHead !== expected.gitHead || actual.integrity !== expected.integrity) {
    throw new Error(`Publication conflicts with ${pkg.name}@${pkg.version}.`);
  }
}

function pack(root, directory, client) {
  const sourceSha = client.head();
  context(client, '--pack', sourceSha);
  client.clean();
  fs.mkdirSync(directory, { recursive: true });
  if (fs.readdirSync(directory).length) {
    throw new Error('Release artifact directory must be empty.');
  }
  const packages = inventory(root).map((pkg) => {
    const published = client.registry(pkg);
    const tarball = client.pack(pkg, sourceSha, directory);
    client.verifyTarball(tarballPath(directory, tarball), pkg, sourceSha);
    return { ...pkg, published, tarball, integrity: integrity(tarballPath(directory, tarball)) };
  });
  fs.writeFileSync(
    path.join(directory, 'manifest.json'),
    `${JSON.stringify({ sourceSha, packages }, null, 2)}\n`
  );
}

async function publish(root, directory, client) {
  const manifest = readManifest(root, directory, client, '--publish');
  const pending = [];
  for (const pkg of manifest.packages) {
    const current = client.registry(pkg);
    if (current) {
      assertPublished(pkg, current, manifest.sourceSha);
      console.log(`Already published and verified: ${pkg.name}@${pkg.version}`);
      continue;
    }
    if (pkg.published) {
      throw new Error('An existing npm publication disappeared.');
    }
    const latest = client.latest(pkg);
    if (latest && compareVersions(pkg.version, latest) < 0) {
      throw new Error('Refusing to move npm latest backwards.');
    }
    pending.push(pkg);
  }
  const failures = [];
  for (const pkg of pending) {
    // The libraries are independent; the CLI requires all of them.
    if (pkg.file === 'package.json' && failures.length) {
      break;
    }
    try {
      console.log(`Publishing: ${pkg.name}@${pkg.version}`);
      client.publish(tarballPath(directory, pkg.tarball));
      console.log(`npm acknowledged publication: ${pkg.name}@${pkg.version}`);
    } catch (error) {
      failures.push(`${pkg.name}@${pkg.version}: ${error.message}`);
    }
  }
  if (failures.length) {
    throw new Error(
      `npm publication failed; CLI and GitHub releases are held back:\n${failures.join('\n')}`
    );
  }
}

function releases(root, directory, client) {
  // The workflow runs this phase only after every npm publish succeeds.
  const manifest = readManifest(root, directory, client, '--releases');
  const currentLatest = client.latestRelease();
  if (
    currentLatest &&
    (currentLatest.draft !== false ||
      currentLatest.prerelease !== false ||
      !(/^v\d+\.\d+\.\d+$/).test(currentLatest.tag_name))
  ) {
    throw new Error('Resolve the current GitHub Latest release before continuing.');
  }
  // Validate the entire release before creating any tags or GitHub releases.
  const plans = manifest.packages.map((pkg) => {
    // Existing versions retain their recorded identity; new versions were
    // acknowledged by npm for this manifest's source and verified tarballs.
    const sha = pkg.published?.gitHead || manifest.sourceSha;
    const existingTagSha = client.tagTarget(pkg.tag);
    const existingRelease = client.release(pkg.tag);
    if (existingTagSha && existingTagSha !== sha) {
      throw new Error('Existing tag does not match npm publication.');
    }
    if (
      existingRelease &&
      (!existingTagSha ||
        existingRelease.draft !== false ||
        existingRelease.prerelease !== false ||
        existingRelease.tag_name !== pkg.tag)
    ) {
      throw new Error('Existing release does not match the stable release policy.');
    }
    if (!existingTagSha && sha !== manifest.sourceSha) {
      throw new Error(
        'A missing historical tag needs manual source review; no tag will be guessed.'
      );
    }
    // Delivery workflows also update Docker latest and the hosted API.
    if (
      !existingRelease &&
      pkg.file === 'package.json' &&
      currentLatest &&
      compareVersions(pkg.version, currentLatest.tag_name.slice(1)) < 0
    ) {
      throw new Error(
        'Recovering an older CLI release needs manual delivery review to prevent a production rollback.'
      );
    }
    return {
      pkg,
      sha,
      existingTagSha,
      existingRelease,
      markLatest:
        pkg.file === 'package.json' &&
        (!currentLatest || compareVersions(pkg.version, currentLatest.tag_name.slice(1)) > 0),
    };
  });
  for (const plan of plans) {
    if (!plan.existingTagSha) {
      client.createTag(plan.pkg.tag, plan.sha);
    }
    if (!plan.existingRelease) {
      client.createRelease(plan.pkg, plan.markLatest);
    }
  }
}

async function main(args = process.argv.slice(2)) {
  const client = adapter();
  if (args.length === 0 || (args.length === 1 && args[0] === '--plan')) {
    console.log(
      JSON.stringify(
        inventory(ROOT).map((pkg) => ({ ...pkg, published: !!client.registry(pkg) })),
        null,
        2
      )
    );
    return;
  }
  if (args.length !== 2 || !['--pack', '--publish', '--releases'].includes(args[0])) {
    throw new Error(
      'Usage: publish-trusted.js [--plan | --pack directory | --publish directory | --releases directory]'
    );
  }
  const directory = path.resolve(args[1]);
  const phase = args[0];
  switch (phase) {
  case '--pack':
    pack(ROOT, directory, client);
    break;
  case '--publish':
    await publish(ROOT, directory, client);
    break;
  case '--releases':
    releases(ROOT, directory, client);
    break;
  }
}

module.exports = {
  inventory,
  stableVersion,
  compareVersions,
  adapter,
  context,
  pack,
  publish,
  releases,
  readManifest,
  integrity,
  assertPublished,
  npmCli,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
