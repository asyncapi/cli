/* eslint-disable @typescript-eslint/no-var-requires */
const { spawnSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Only allow these shell types for now, can add more later.
const allowedShells = ['zsh', 'bash', 'fish', 'powershell'];

// Shell configuration for different environments.
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
  fish: {
    rcFile: path.join(
      os.homedir(),
      '.config',
      'fish',
      'completions',
      'asyncapi.fish'
    ),
    detectFile: path.join(os.homedir(), '.config', 'fish', 'config.fish'),
    postMessage: '',
    action: (output, rcFile) => {
      const dir = path.dirname(rcFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(rcFile, output);
    },
  },
  powershell: {
    // These will be set dynamically.
    detectFile: null,
    rcFile: null,
    postMessage: 'Restart PowerShell to apply.',
    action: (output, rcFile) => {
      const dir = path.dirname(rcFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(rcFile, `\n# AsyncAPI CLI Autocomplete\n${output}\n`);
    },
  },
};

// Default PowerShell executable path on Windows.
const POWERSHELL_PATH =
  'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';

/**
 * Returns a sanitized shell configuration for the given shell.
 * Only returns a new object with known keys.
 * @param {string} shell - The shell name.
 * @returns {Object} The sanitized shell configuration.
 */
function getShellConfig(shell) {
  if (!allowedShells.includes(shell)) {
    throw new Error(`Unsupported shell: ${shell}`);
  }
  const config = shellConfigs[shell];
  return {
    rcFile: config.rcFile,
    detectFile: config.detectFile,
    postMessage: config.postMessage,
    action: config.action,
  };
}

/**
 * Ensures that the directory and file for a given path exist.
 * @param {string} filePath - The file path to ensure.
 */
function ensureDirectoryAndFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } catch (err) {
      console.warn(`Failed to create directory ${dir}: ${err.message}`);
    }
  }
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, '# PowerShell Profile\n');
      console.log(`Created file: ${filePath}`);
    } catch (err) {
      console.warn(`Failed to create file ${filePath}: ${err.message}`);
    }
  }
}

/**
 * Detects the current shell.
 * For PowerShell on Windows, it attempts to get the profile path using a spawn call.
 * @returns {string|null} Detected shell name or null if none detected.
 */
function detectShell() {
  for (const [shell, config] of Object.entries(shellConfigs)) {
    if (shell === 'powershell' && os.platform() === 'win32') {
      const safeEnv = { ...process.env, PATH: 'C:\\Windows\\System32' };
      const result = spawnSync(
        POWERSHELL_PATH,
        ['-NoProfile', '-Command', '$PROFILE.CurrentUserAllHosts'],
        { encoding: 'utf-8', env: safeEnv }
      );
      if (result.status === 0 && result.stdout) {
        const profilePath = result.stdout.trim();
        ensureDirectoryAndFile(profilePath);
        shellConfigs.powershell.rcFile = profilePath;
        shellConfigs.powershell.detectFile = profilePath;
        return 'powershell';
      }
      const defaultProfilePath = path.join(
        os.homedir(),
        'Documents',
        'WindowsPowerShell',
        'profile.ps1'
      );
      ensureDirectoryAndFile(defaultProfilePath);
      shellConfigs.powershell.rcFile = defaultProfilePath;
      shellConfigs.powershell.detectFile = defaultProfilePath;
      return 'powershell';
    }
    if (config.detectFile && fs.existsSync(config.detectFile)) {
      return shell;
    }
  }
  return null;
}

/**
 * Checks a potential path for the CLI executable.
 * @param {string} potentialPath - A potential executable path.
 * @returns {string|null} The valid executable path or null.
 */
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

/**
 * Finds the CLI executable from a list of possible locations.
 * @returns {string} Path to the CLI executable.
 * @throws {Error} If no executable is found.
 */
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
    } catch (error) {
      // Continue checking other paths.
    }
  }

  try {
    const files = fs.readdirSync('.');
    for (const file of files) {
      if (['asyncapi', 'asyncapi.cmd', 'run', 'run.cmd'].includes(file)) {
        const fullPath = path.resolve(`./${file}`);
        console.log(`Found potential CLI executable at: ${fullPath}`);
        return fullPath;
      }
    }
  } catch (error) {
    // Ignore errors.
  }
  throw new Error('CLI executable not found.');
}

/**
 * Generates the autocomplete script output by running the CLI command.
 * @param {string} shell - The target shell.
 * @returns {string} The generated autocomplete script.
 * @throws {Error} If the script generation fails.
 */
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

/**
 * Sets up autocomplete for the detected shell.
 * For PowerShell, uses the built-in implementation.
 * For other shells, generates the script and applies it.
 * @param {string} shell - The detected shell.
 * @throws {Error} If configuration fails.
 */
function setupAutocomplete(shell) {
  if (!allowedShells.includes(shell)) {
    throw new Error(`Unsupported shell: ${shell}`);
  }
  const config = getShellConfig(shell);

  if (shell === 'powershell') {
    if (!config.rcFile) {
      throw new Error('PowerShell configuration file not found.');
    }
    return setupPowershellAutocomplete(config.rcFile);
  }

  console.log(`Generating autocomplete script for ${shell}...`);
  const output = generateAutocompleteScript(shell);
  if (!config.rcFile) {
    throw new Error(`Unsupported shell: ${shell}`);
  }
  config.action(output, config.rcFile);
  console.log(`✅ Autocomplete configured for ${shell}. ${config.postMessage}`);
}

/**
 * Sets up PowerShell autocomplete by appending a predefined script
 * to the user's PowerShell profile.
 * @param {string} rcFile - The PowerShell profile file.
 * @returns {boolean} True if setup succeeds.
 */
function setupPowershellAutocomplete(rcFile) {
  const powershellScript = `
# AsyncAPI CLI Autocomplete for PowerShell
Register-ArgumentCompleter -Native -CommandName asyncapi -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)
    $commands = @(
        "bundle",
        "validate",
        "generate",
        "generate:html",
        "generate:markdown",
        "convert",
        "diff",
        "help",
        "new",
        "new:template",
        "version",
        "autocomplete"
    )
    $matchingCommands = $commands | Where-Object { $_ -like "$wordToComplete*" }
    $matchingCommands | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', "asyncapi $_")
    }
}`;
  try {
    fs.appendFileSync(rcFile, `\n${powershellScript}\n`);
    console.log(
      `✅ PowerShell autocomplete configured. ${shellConfigs.powershell.postMessage}`
    );
    return true;
  } catch (error) {
    throw new Error(
      `Failed to add PowerShell autocomplete script: ${error.message}`
    );
  }
}

// Main execution: Detect shell and configure autocomplete.
const shell = detectShell();
if (shell) {
  try {
    setupAutocomplete(shell);
  } catch (error) {
    console.warn(error.message);
  }
} else {
  console.log(
    '⚠️ Shell not detected or unsupported. Skipping autocomplete setup.'
  );
}