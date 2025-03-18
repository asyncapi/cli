const { spawnSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const shellConfigs = {
  zsh: {
    rcFile: path.join(os.homedir(), '.zshrc'),
    detectFile: path.join(os.homedir(), '.zshrc'),
    postMessage: 'Run: source ~/.zshrc',
    action: (output, rcFile) => fs.appendFileSync(rcFile, `\n# AsyncAPI CLI Autocomplete\n${output}\n`),
  },
  bash: {
    rcFile: path.join(os.homedir(), '.bashrc'),
    detectFile: path.join(os.homedir(), '.bashrc'),
    postMessage: 'Run: source ~/.bashrc',
    action: (output, rcFile) => fs.appendFileSync(rcFile, `\n# AsyncAPI CLI Autocomplete\n${output}\n`),
  },
  fish: {
    rcFile: path.join(os.homedir(), '.config', 'fish', 'completions', 'asyncapi.fish'),
    detectFile: path.join(os.homedir(), '.config', 'fish', 'config.fish'),
    postMessage: '',
    action: (output, rcFile) => {
      const dir = path.dirname(rcFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(rcFile, output);
    },
  },
  powershell: {
    detectFile: null,
    rcFile: null,
    postMessage: 'Restart PowerShell to apply.',
    action: (output, rcFile) => fs.appendFileSync(rcFile, `\n# AsyncAPI CLI Autocomplete\n${output}\n`),
  },
};

// Absolute path to powershell executable (default Windows location)
const POWERSHELL_PATH = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';

function detectShell() {
  for (const [shell, config] of Object.entries(shellConfigs)) {
    if (shell === 'powershell' && os.platform() === 'win32') {
      const safeEnv = { ...process.env, PATH: 'C:\\Windows\\System32' }; // Restrict PATH

      const result = spawnSync(
        POWERSHELL_PATH,
        ['-NoProfile', '-Command', '$PROFILE.CurrentUserAllHosts'],
        { encoding: 'utf-8', env: safeEnv }
      );

      if (result.status === 0 && result.stdout) {
        const profilePath = result.stdout.trim();
        if (fs.existsSync(profilePath)) {
          shellConfigs.powershell.rcFile = profilePath;
          return 'powershell';
        }
      }
    } else if (fs.existsSync(config.detectFile)) {
      return shell;
    }
  }
  return null;
}

function setupAutocomplete(shell) {
  try {
    const safeEnv = { ...process.env, PATH: process.env.PATH }; // Optionally sanitize PATH

    const result = spawnSync(
      path.resolve('./bin/run'), // Absolute path safer
      ['autocomplete', 'script', shell],
      { encoding: 'utf-8', env: safeEnv }
    );

    if (result.status !== 0) {
      console.warn(`⚠️ ${shell} autocomplete setup failed:`, result.stderr || 'Unknown error');
      return;
    }

    const output = result.stdout;
    const config = shellConfigs[shell];

    if (config && config.rcFile) {
      config.action(output, config.rcFile);
      console.log(`✅ Autocomplete configured for ${shell}. ${config.postMessage}`);
    } else {
      console.log(`⚠️ Unsupported shell: ${shell}`);
    }
  } catch (error) {
    console.warn(`⚠️ ${shell} autocomplete setup encountered an error:`, error.message);
  }
}

// Detect shell and configure
const shell = detectShell();
if (shell) {
  setupAutocomplete(shell);
} else {
  console.log('⚠️ Shell not detected or unsupported. Skipping autocomplete setup.');
}
