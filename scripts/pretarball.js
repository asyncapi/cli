/* eslint-disable no-console */
/*
 * scripts/pretarball.js
 *
 * Run by oclif (`npm run pretarball`) inside the packing workspace,
 * AFTER `npm install --production` and BEFORE the installer/tarball is built
 * (see oclif's tarballs build step). The current working directory is the
 * oclif workspace root.
 *
 * It removes the Next.js `output: 'standalone'` build that is shipped inside
 * the published `@asyncapi/studio` package. The CLI launches Studio/Preview
 * via the programmatic Next server with `distDir: 'build'`
 * (see src/domains/models/Studio.ts and src/domains/models/Preview.ts), which
 * reads from `build/` as described by `build/required-server-files.json` and
 * never uses `build/standalone`.
 *
 * That standalone folder contains a deeply-nested, pnpm-structured
 * `node_modules/.pnpm/next@.../...` tree with paths exceeding the Windows
 * 260-character MAX_PATH limit, which breaks the NSIS Windows installer with
 * "Error opening file for writing". Pruning it here keeps those paths out of
 * every packed artifact (win/macos/linux) without affecting runtime behaviour.
 *
 * See: https://github.com/asyncapi/cli/issues/2239
 */

const fs = require('fs');
const path = require('path');

// Paths are relative to the oclif workspace root (process.cwd()).
const targets = [
  path.join('node_modules', '@asyncapi', 'studio', 'build', 'standalone'),
];

for (const rel of targets) {
  const abs = path.resolve(process.cwd(), rel);
  if (fs.existsSync(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
    console.log(`[pretarball] removed ${rel}`);
  } else {
    console.log(`[pretarball] skip (not found) ${rel}`);
  }
}
