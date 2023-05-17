// Import the necessary modules
const fs = require('fs').promises;
const { exec } = require('child_process');

// Define the paths to the README and usage files
const README_PATH = './scripts/README.md'; // File path for the generated README file
const USAGE_PATH = './docs/usage.md'; // File path for the usage documentation file

// Append usage and commands tags to the README file
// These tags are later replaced by the `oclif readme` command with actual usage documentation
fs.appendFile(README_PATH, '\n\n# Usage\n\n<!-- usage -->\n\n# Commands\n\n<!-- commands -->\n')
  .then(() => {
    // Generate the usage documentation using the `oclif readme` command
    return new Promise((resolve, reject) => {
      exec('oclif readme', { cwd: './scripts' }, (error) => {
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
    return fs.writeFile(USAGE_PATH, readmeContents, { flag: 'a' });
  })
  .then(() => {
    // Remove the generated README file
    return fs.unlink(README_PATH);
  })
  .catch((err) => {
    console.error(err);
  });
