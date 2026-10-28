'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { ROOT } = require('./fixtures');
const workflow = (name) =>
  yaml.load(
    fs.readFileSync(path.join(ROOT, '.github/workflows', name), 'utf8'),
  );

test('build/install jobs have no publishing credentials; OIDC publication has no build or install', () => {
  const release = workflow('release-with-changesets.yml');
  assert.deepEqual(release.permissions, { contents: 'read' });
  for (const name of ['test', 'packages']) {
    assert.ok(!JSON.stringify(release.jobs[name]).includes('secrets.'));
    assert.equal(release.jobs[name].permissions?.['id-token'], undefined);
  }
  assert.equal(release.jobs.publish.permissions['id-token'], 'write');
  assert.ok(!JSON.stringify(release.jobs.publish).includes('secrets.'));
  for (const step of release.jobs.publish.steps) {
    assert.doesNotMatch(step.run || '', /npm (?:ci|install|run build)/);
  }
  assert.equal(
    release.jobs['github-release'].permissions?.['id-token'],
    undefined,
  );
  assert.ok(release.jobs['github-release'].needs.includes('publish'));
  for (const job of Object.values(release.jobs)) {
    for (const step of job.steps) {
      if (step.uses) {
        assert.match(step.uses, /@[a-f0-9]{40}$/);
      }
      if (step.uses?.startsWith('actions/checkout@')) {
        assert.equal(step.with['persist-credentials'], false);
      }
    }
  }
});

test('existing delivery jobs reject library/prerelease events and build installers from the release tag', () => {
  for (const [file, jobs] of [
    ['release-docker.yml', ['publish-docker', 'publish-action-docker']],
    ['upload-release-assets.yml', ['upload-assets']],
    ['release-server-api.yml', ['publish-docker']],
  ]) {
    const delivery = workflow(file);
    for (const name of jobs) {
      assert.ok(
        delivery.jobs[name].if.includes(
          'startsWith(github.event.release.tag_name, \'v\')',
        ),
      );
      assert.ok(
        delivery.jobs[name].if.includes('!github.event.release.prerelease'),
      );
    }
  }
  const assets = workflow('upload-release-assets.yml').jobs['upload-assets'];
  assert.notEqual(assets['continue-on-error'], true);
  assert.equal(
    assets.steps.find((step) => step.uses?.startsWith('actions/checkout@')).with
      .ref,
    '${{ github.event.release.tag_name }}',
  );
});
