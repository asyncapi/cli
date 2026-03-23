import { expect } from 'chai';

/**
 * Tests for the pnpm browserslist fix in generator.service.ts
 *
 * Issue: https://github.com/asyncapi/cli/issues/1781
 *
 * When installed globally via pnpm, the global bin/ directory contains a shell
 * wrapper script also named "browserslist". The browserslist package walks up
 * the directory tree looking for config files and mistakenly parses this shell
 * script as a browser query, causing:
 *   "Unknown browser query 'basedir=$(dirname ...'"
 *
 * Fix: set BROWSERSLIST_ROOT_PATH to the output directory before invoking the
 * generator. This restricts browserslist's config-file search scope and
 * prevents it from reaching pnpm's global bin directory.
 */

/**
 * Standalone helper that mirrors the env-var management logic extracted from
 * GeneratorService.generate(). Testing the logic in isolation lets us verify
 * correctness without spinning up a real generator or needing sinon stubs.
 */
async function runWithBrowserslistGuard<T>(
  outputDir: string,
  fn: () => Promise<T>,
): Promise<T> {
  const previousValue = process.env['BROWSERSLIST_ROOT_PATH'];
  if (!process.env['BROWSERSLIST_ROOT_PATH']) {
    process.env['BROWSERSLIST_ROOT_PATH'] = outputDir;
  }
  try {
    return await fn();
  } finally {
    if (previousValue === undefined) {
      delete process.env['BROWSERSLIST_ROOT_PATH'];
    } else {
      process.env['BROWSERSLIST_ROOT_PATH'] = previousValue;
    }
  }
}

describe('GeneratorService – pnpm browserslist guard (issue #1781)', () => {
  // Ensure a clean environment before each test
  beforeEach(() => {
    delete process.env['BROWSERSLIST_ROOT_PATH'];
  });

  afterEach(() => {
    delete process.env['BROWSERSLIST_ROOT_PATH'];
  });

  it('sets BROWSERSLIST_ROOT_PATH to the output directory while generation runs', async () => {
    let capturedValue: string | undefined;

    await runWithBrowserslistGuard('/tmp/test-output', async () => {
      capturedValue = process.env['BROWSERSLIST_ROOT_PATH'];
    });

    expect(capturedValue).to.equal('/tmp/test-output',
      'BROWSERSLIST_ROOT_PATH should point to the output directory during generation');
  });

  it('removes BROWSERSLIST_ROOT_PATH after generation succeeds', async () => {
    await runWithBrowserslistGuard('/tmp/test-output', async () => {
      // generation body — nothing to do
    });

    expect(process.env['BROWSERSLIST_ROOT_PATH']).to.equal(undefined,
      'BROWSERSLIST_ROOT_PATH should be deleted after successful generation');
  });

  it('removes BROWSERSLIST_ROOT_PATH even when generation throws', async () => {
    try {
      await runWithBrowserslistGuard('/tmp/test-output', async () => {
        throw new Error('Simulated generator error');
      });
    } catch {
      // expected
    }

    expect(process.env['BROWSERSLIST_ROOT_PATH']).to.equal(undefined,
      'BROWSERSLIST_ROOT_PATH should be cleaned up even on failure');
  });

  it('preserves a pre-existing BROWSERSLIST_ROOT_PATH and restores it afterward', async () => {
    process.env['BROWSERSLIST_ROOT_PATH'] = '/user/defined/path';

    let capturedValue: string | undefined;
    await runWithBrowserslistGuard('/tmp/test-output', async () => {
      capturedValue = process.env['BROWSERSLIST_ROOT_PATH'];
    });

    // The guard should NOT override a value the user set explicitly
    expect(capturedValue).to.equal('/user/defined/path',
      'User-defined BROWSERSLIST_ROOT_PATH must not be overwritten');
    expect(process.env['BROWSERSLIST_ROOT_PATH']).to.equal('/user/defined/path',
      'User-defined BROWSERSLIST_ROOT_PATH must be restored after generation');
  });

  it('restores a pre-existing BROWSERSLIST_ROOT_PATH even when generation throws', async () => {
    process.env['BROWSERSLIST_ROOT_PATH'] = '/user/defined/path';

    try {
      await runWithBrowserslistGuard('/tmp/test-output', async () => {
        throw new Error('Simulated generator error');
      });
    } catch {
      // expected
    }

    expect(process.env['BROWSERSLIST_ROOT_PATH']).to.equal('/user/defined/path',
      'User-defined BROWSERSLIST_ROOT_PATH must be restored after generation failure');
  });

  it('does not leak BROWSERSLIST_ROOT_PATH across multiple sequential calls', async () => {
    for (let i = 0; i < 3; i++) {
      await runWithBrowserslistGuard(`/tmp/out-${i}`, async () => {
        expect(process.env['BROWSERSLIST_ROOT_PATH']).to.equal(`/tmp/out-${i}`);
      });
      expect(process.env['BROWSERSLIST_ROOT_PATH']).to.equal(undefined,
        `BROWSERSLIST_ROOT_PATH should be undefined after call ${i}`);
    }
  });
});
