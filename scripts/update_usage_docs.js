import { promises as fs } from 'fs';
import { exec } from 'child_process';

const README_PATH = './scripts/README.md';
const USAGE_PATH = './docs/usage.md';

(async () => {
  try {
    // Append usage and commands tags to the README file
    // These tags are later replaced by the `oclif readme` command with actual usage documentation
    await fs.appendFile(README_PATH, '\n\n# Usage\n\n<!-- usage -->\n\n# Commands\n\n<!-- commands -->\n');

    // Generate the usage documentation using the `oclif readme` command
    await new Promise((resolve, reject) => {
      exec('oclif readme', { cwd: './scripts' }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    // Define the header for the usage file
    const header = `---
title: 'Usage'
weight: 40
---

The AsyncAPI CLI makes it easier to work with AsyncAPI documents.
`;

    // Write the header to the usage file
    await fs.writeFile(USAGE_PATH, header);

    // Read the contents of the README file
    const readmeContents = await fs.readFile(README_PATH, 'utf8');

    // Append the README contents to the usage file
    await fs.appendFile(USAGE_PATH, `\n${readmeContents}`);

    // Remove the generated README file
    await fs.unlink(README_PATH);
  } catch (err) {
    console.error(err);
  }
})();
