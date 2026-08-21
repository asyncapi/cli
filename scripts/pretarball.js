/* eslint-disable no-console */

const fs = require('node:fs');
const path = require('node:path');

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
