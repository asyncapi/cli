const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');
const version = packageJson.version;

console.log(`Packaging AsyncAPI CLI version ${version} for Windows...`);

const targetFile = path.resolve('node_modules/oclif/lib/tarballs/build.js');

if (!fs.existsSync(targetFile)) {
  console.error(`File not found: ${targetFile}`);
  throw error;
}

console.log(`Found target file: ${targetFile}`);

const backupPath = `${targetFile}.backup`;
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(targetFile, backupPath);
  console.log(`Backed up original file to: ${backupPath}`);
}

let fileContent = fs.readFileSync(targetFile, 'utf8');

if (fileContent.includes('--force-local')) {
  console.log('Patching file to remove --force-local flag');
  fileContent = fileContent.replace(/--force-local/g, '');
  fs.writeFileSync(targetFile, fileContent);
  console.log('File patched successfully');
} else {
  console.log('No --force-local flag found in the file. It may have been already patched.');
}

try {
  console.log('Running oclif pack win...');
  const oclifResult = spawnSync('oclif', ['pack', 'win'], {
    stdio: 'inherit',
    shell: true
  });

  if (oclifResult.status !== 0) {
    console.error('Oclif packaging failed with status:', oclifResult.status);
    throw error;
  }

  console.log('Running rename script...');
  const renameResult = spawnSync('node', ['scripts/releasePackagesRename.js'], {
    stdio: 'inherit',
    shell: true
  });

  if (renameResult.status !== 0) {
    console.error('Rename script failed with status:', renameResult.status);
    throw error;
  }
  console.log('Windows packaging completed successfully!');
} catch (err) {
  console.error('Error during packaging:', err);
} finally {
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, targetFile);
    console.log('Restored original file');
    fs.unlinkSync(backupPath);
    console.log('Removed backup file');
  }
}
