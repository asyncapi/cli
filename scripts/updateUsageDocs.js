/* eslint-disable @typescript-eslint/no-var-requires */
const {writeFile, readFile} = require('fs').promises;

// Define the paths to the README and usage files
const README_PATH = './scripts/README.md'; // File path for the generated README file
const USAGE_PATH = './docs/usage.md'; // File path for the usage documentation file

const header = `---
title: 'Usage'
weight: 40
---

The AsyncAPI CLI makes it easier to work with AsyncAPI documents.
`;

// Define an async function to write the header and the README contents to the usage documentation file
async function run() {
  try {
    await writeFile(USAGE_PATH, header);
    const readmeContents = await readFile(README_PATH, 'utf8');
      // Append the contents of the README file to the usage documentation file
    await writeFile(USAGE_PATH, readmeContents, { flag: 'a' });
  } catch (e) {
    console.error(e);
  }
}

run();