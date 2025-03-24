/* eslint-disable @typescript-eslint/no-var-requires */
const { spawnSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Supported shells
const allowedShells = ['zsh', 'bash'];

const shellConfigs = {
  zsh: {
    rcFile: path.join(os.homedir(), '.zshrc'),
    detectFile: path.join(os.homedir(), '.zshrc'),
    postMessage: 'Run: source ~/.zshrc',
    action: (output, rcFile) => {
      fs.appendFileSync(rcFile, `\n# AsyncAPI CLI Autocomplete\n${output}\n`);
    },
  },
  bash: {
    rcFile: path.join(os.homedir(), '.bashrc'),
    detectFile: path.join(os.homedir(), '.bashrc'),
    postMessage: 'Run: source ~/.bashrc',
    action: (output, rcFile) => {
      fs.appendFileSync(rcFile, `\n# AsyncAPI CLI Autocomplete\n${output}\n`);
    },
  },
};

function getShellConfig(shell) {
  if (!allowedShells.includes(shell)) {
    throw new Error(`Unsupported shell: ${shell}`);
  }
  return shellConfigs[shell];
}

function detectShell() {
  const detectedShells = [];
  for (const [shell, config] of Object.entries(shellConfigs)) {
    if (config.detectFile && fs.existsSync(config.detectFile)) {
      detectedShells.push(shell);
    }
  }
  return detectedShells;
}

function checkPotentialPath(potentialPath) {
  let foundPath = null;
  if (potentialPath.includes(path.sep)) {
    if (fs.existsSync(potentialPath)) {
      foundPath = potentialPath;
    }
  } else {
    const whichCommand = os.platform() === 'win32' ? 'where' : 'which';
    const result = spawnSync(whichCommand, [potentialPath], {
      encoding: 'utf-8',
      shell: true,
    });
    if (result.status === 0 && result.stdout) {
      foundPath = result.stdout.trim().split('\n')[0];
    }
  }
  return foundPath;
}

function findCliExecutable() {
  const possiblePaths = [
    path.resolve('./bin/run'),
    path.resolve('./bin/run.cmd'),
    path.resolve('../bin/run'),
    path.resolve('../bin/run.cmd'),
    path.resolve('./node_modules/.bin/asyncapi'),
    path.resolve('./node_modules/.bin/asyncapi.cmd'),
    'asyncapi',
    'asyncapi.cmd',
  ];

  for (const potentialPath of possiblePaths) {
    try {
      const foundPath = checkPotentialPath(potentialPath);
      if (foundPath) {
        console.log(`Found CLI executable at: ${foundPath}`);
        return foundPath;
      }
    } catch (error) {}
  }

  throw new Error('CLI executable not found.');
}

function generateAutocompleteScript(shell) {
  const executablePath = findCliExecutable();
  const result = spawnSync(executablePath, ['autocomplete', 'script', shell], {
    encoding: 'utf-8',
    env: { ...process.env },
    stdio: 'pipe',
    shell: true,
  });

  console.log('Command output:', {
    status: result.status,
    stdout: result.stdout
      ? `${result.stdout.substring(0, 100)}${
          result.stdout.length > 100 ? '...' : ''
        }`
      : '(no stdout)',
    stderr: result.stderr
      ? `${result.stderr.substring(0, 100)}${
          result.stderr.length > 100 ? '...' : ''
        }`
      : '(no stderr)',
  });

  if (result.status !== 0 || result.error) {
    throw new Error(
      `Autocomplete setup for ${shell} failed: ${
        result.stderr || result.error?.message || 'Unknown error'
      }`
    );
  }

  const output = result.stdout;
  if (!output || output.trim() === '') {
    throw new Error(`No autocomplete script generated for ${shell}.`);
  }
  return output;
}

function setupAutocomplete(shell) {
  if (!allowedShells.includes(shell)) {
    throw new Error(`Unsupported shell: ${shell}`);
  }
  const config = getShellConfig(shell);

  console.log(`Generating autocomplete script for ${shell}...`);
  const output = generateAutocompleteScript(shell);

  config.action(output, config.rcFile);
  console.log(`✅ Autocomplete configured for ${shell}. ${config.postMessage}`);
}

const shells = detectShell();
if (shells.length) {
  for (const shell of shells) {
    try {
      setupAutocomplete(shell);
    } catch (error) {
      console.warn(error.message);
    }
  }
} else {
  console.log('⚠️ Shell not detected or unsupported. Skipping autocomplete setup.');
}
