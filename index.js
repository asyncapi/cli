const os = require('os');
const fs = require('fs');
const path = require('path');
function detectShell() {
    const homeDir = os.homedir();
    
  
    if (fs.existsSync(path.join(homeDir, '.zshrc'))) return 'zsh';
    if (fs.existsSync(path.join(homeDir, '.bashrc'))) return 'bash';
    if (fs.existsSync(path.join(homeDir, '.config', 'fish', 'config.fish'))) return 'fish';
  
    // Check for PowerShell profile (Windows)
    if (os.platform() === 'win32') {
      try {
        const profilePath = execSync('powershell -NoProfile -Command "$PROFILE.CurrentUserAllHosts"', { encoding: 'utf-8' }).trim();
        if (fs.existsSync(profilePath)) return 'powershell';
      } catch (err) {
        // Ignore error
      }
    }
  
    return null;
  }
console.log(detectShell())