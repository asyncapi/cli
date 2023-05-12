const fs = require('fs');
const util = require('util');
const { exec } = require('child_process');
const execPromisified = util.promisify(exec);

const README_PATH = './README.md';
const USAGE_PATH = '../docs/usage.md';

fs.appendFileSync(README_PATH, '\n\n# Usage\n\n<!-- usage -->\n\n# Commands\n\n<!-- commands -->\n');

execPromisified('oclif readme').then(() => {
  const header = `---
title: 'Usage'
weight: 40
---

The AsyncAPI CLI makes it easier to work with AsyncAPI documents.
`;

  fs.writeFileSync(USAGE_PATH, header);

  const readmeContents = fs.readFileSync(README_PATH, 'utf8');

  fs.appendFileSync(USAGE_PATH, `\n${readmeContents}`);

  fs.unlinkSync(README_PATH);
}).catch((err) => {
  console.error(err);
});
