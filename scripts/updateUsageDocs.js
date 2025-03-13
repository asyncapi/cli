

/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFile, readFile } = require('fs').promises;
const path = require('path');

const README_PATH = path.resolve(__dirname, '../scripts/README.md'); // Adjust path if needed
const USAGE_PATH = path.resolve(__dirname, '../docs/usage.md'); 
const MAX_RETRIES = 5; // Prevents infinite loop
const RETRY_DELAY = 3000; // 3 seconds

const header = `---
title: 'Usage'
weight: 40
---

<!-- 

This file is automatically generated from updateUsageDocs.js script. The following steps are executed (see package.json lines 158-161):

1️⃣ **generate:readme:create** - Generates initial README structure.  
2️⃣ **generate:readme:commands** - Runs \`oclif readme\` to extract CLI commands.  
3️⃣ **generate:assets** - Merges content to finalize assets.  
4️⃣ **generate:commands** - Runs all the above + updates usage docs.  

-->

The AsyncAPI CLI makes it easier to work with AsyncAPI documents.
`;

/**
 * Updates the usage documentation file by appending README content.
 */
async function run() {
  try {
    console.log('📌 Updating usage documentation...');
    await writeFile(USAGE_PATH, header);
    
    const readmeContents = await readContents();
    await writeFile(USAGE_PATH, readmeContents, { flag: 'a' });

    console.log('✅ usage.md updated successfully.');
  } catch (error) {
    console.error(`❌ Error updating usage.md: ${error.message}`);
  }
}

/**
 * Reads README.md and ensures commands are generated before proceeding.
 */
async function readContents() {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      const readmeContents = await readFile(README_PATH, 'utf8');

      // Extract command section
      const commandsStartText = '<!-- commands -->';
      const commandStopText = '<!-- commandsstop -->';
      const commandStartIndex = readmeContents.indexOf(commandsStartText);
      const commandStopIndex = readmeContents.indexOf(commandStopText);

      if (commandStartIndex === -1 || commandStopIndex === -1) {
        throw new Error('Command markers not found in README.md');
      }

      // Extract and validate commands section
      const commandsContent = readmeContents.slice(commandStartIndex + commandsStartText.length, commandStopIndex).trim();
      
      if (commandsContent.length > 0) {
        console.log('✅ Commands found! Proceeding...');
        return readmeContents;
      }

      console.log(`⚠️ Attempt ${attempt + 1}/${MAX_RETRIES}: No commands found. Retrying...`);
    } catch (error) {
      console.error(`❌ Error reading README.md: ${error.message}`);
    }

    attempt++;
    await delay(RETRY_DELAY);
  }

  throw new Error('🚨 Max retries reached. Commands section is empty.');
}

/**
 * Delay function for retry mechanism.
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

run();
