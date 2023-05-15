import fs from 'fs';
import util from 'util';
import { exec } from 'child_process';

const execPromisified = util.promisify(exec);

// Define the paths to the README (which will be created inside the ./script folder) and usage files
const README_PATH = './README.md';
const USAGE_PATH = '../docs/usage.md';

// Append the usage and commands tags to the README file
// The readme must have any of the following tags inside of it for it to be replaced after running `oclif readme` command
// # Usage
// <!-- usage -->
// # Commands
// <!-- commands -->
fs.appendFileSync(README_PATH, '\n\n# Usage\n\n<!-- usage -->\n\n# Commands\n\n<!-- commands -->\n');

// Generate the usage documentation using the `oclif readme` command
execPromisified('oclif readme')
  .then(() => {
    // Define the header for the usage file
    const header = `---
title: 'Usage'
weight: 40
---

The AsyncAPI CLI makes it easier to work with AsyncAPI documents.
`;

    fs.writeFileSync(USAGE_PATH, header);
    const readmeContents = fs.readFileSync(README_PATH, 'utf8');
    fs.appendFileSync(USAGE_PATH, `\n${readmeContents}`);

    // Remove the generated README file
    fs.unlinkSync(README_PATH);
  })
  .catch((err) => {
    console.error(err);
  });
