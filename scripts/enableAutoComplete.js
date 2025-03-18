const { execSync } = require('child_process');
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
    detectFile: null, // will be dynamically checked
    rcFile: null,     // will be dynamically fetched
    postMessage: 'Restart PowerShell to apply.',
    action: (output, rcFile) => fs.appendFileSync(rcFile, `\n# AsyncAPI CLI Autocomplete\n${output}\n`),
  },
};

function detectShell() {
  for (const [shell, config] of Object.entries(shellConfigs)) {
    if (shell === 'powershell' && os.platform() === 'win32') {
      try {
        const profilePath = execSync('powershell -NoProfile -Command "$PROFILE.CurrentUserAllHosts"', { encoding: 'utf-8' }).trim();
        if (fs.existsSync(profilePath)) {
          shellConfigs.powershell.rcFile = profilePath; // set dynamically
          return 'powershell';
        }
      } catch (err) { /* ignore */ }
    } else if (fs.existsSync(config.detectFile)) {
      return shell;
    }
  }
  return null;
}

function setupAutocomplete(shell) {
  try {
    const cmd = `./bin/run autocomplete script ${shell}`;
    const output = execSync(cmd, { encoding: 'utf-8' });

    const config = shellConfigs[shell];
    if (config && config.rcFile) {
      config.action(output, config.rcFile);
      console.log(`✅ Autocomplete configured for ${shell}. ${config.postMessage}`);
    } else {
      console.log(`⚠️ Unsupported shell: ${shell}`);
    }

  } catch (error) {
    console.warn(`⚠️ ${shell} autocomplete setup failed:`, error.message);
  }
}

const shell = detectShell();
if (shell) {
  setupAutocomplete(shell);
} else {
  console.log('⚠️ Shell not detected or unsupported. Skipping autocomplete setup.');
}
