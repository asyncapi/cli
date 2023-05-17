const fs = require('fs').promises;
const { exec } = require('child_process');

// Define the paths to the README (which will be created inside the ./script folder) and usage files
const README_PATH = './scripts/README.md';
const USAGE_PATH = './docs/usage.md';
// const README_PATH = './README.md';
// const USAGE_PATH = '../docs/usage.md';

// Append the usage and commands tags to the README file
// The readme must have any of the following tags inside of it for it to be replaced after running `oclif readme` command
// # Usage
// <!-- usage -->
// # Commands
// <!-- commands -->
fs.appendFile(README_PATH, '\n\n# Usage\n\n<!-- usage -->\n\n# Commands\n\n<!-- commands -->\n')
  .then(() => {
    // Generate the usage documentation using the `oclif readme` command
    return new Promise((resolve, reject) => {
      exec('oclif readme', (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  })
  .then(() => {
    // Define the header for the usage file
    const header = `---
title: 'Usage'
weight: 40
---

The AsyncAPI CLI makes it easier to work with AsyncAPI documents.
`;

    // Write the header to the usage file
    return fs.writeFile(USAGE_PATH, header);
  })
  .then(() => {
    // Read the contents of the README file
    return fs.readFile(README_PATH, 'utf8');
  })
  .then((readmeContents) => {
    // Append the README contents to the usage file
    return fs.appendFile(USAGE_PATH, `\n${readmeContents}`);
  })
  .then(() => {
    // Remove the generated README file
    return fs.unlink(README_PATH);
  })
  .catch((err) => {
    console.error(err);
  });
