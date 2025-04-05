/* eslint-disable @typescript-eslint/no-var-requires */

const { rename, access, mkdir } = require('fs').promises;
const packageJson = require('../package.json');
const path = require('path');
const simpleGit = require('simple-git');
const git = simpleGit({baseDir: process.cwd()});

async function fileExists(checkPath) {
  try {
    await access(checkPath);
    return true;
  } catch (e) {
    return false;
  }
}

async function checkAndRenameFile(generatedPath, newPath) {
  if (await fileExists(generatedPath)) {
    await rename(generatedPath, newPath);
  }
}

async function createDirectory(directoryPath) {
  const exists = await fileExists(directoryPath);
  if (!exists) {
    await mkdir(directoryPath);
  }
}

async function renameDeb({version, name, sha}) {
  const dist = 'dist/deb';

  // deb package naming convention: https://github.com/oclif/oclif/blob/fb5da961f925fa0eba5c5b05c8cee0c9bd156c00/src/upload-util.ts#L51
  const generatedPath = path.resolve(dist, `${name}_${version}.${sha}-1_amd64.deb`);
  const newPath = path.resolve(dist, 'asyncapi.deb');
  await checkAndRenameFile(generatedPath, newPath);
}

async function renameTar({version, name, sha}) {
  const dist = 'dist';

  const generatedPath = path.resolve(dist, `${name}-v${version}-${sha}-linux-x64.tar.gz`);
  // for tarballs, the files are generated in `dist/` directory.
  // Creates a new `tar` directory(`dist/tar`), and moves the generated tarball inside that directory.
  const tarDirectory = path.resolve(dist, 'tar');
  await createDirectory(tarDirectory);
  const newPath = path.resolve(tarDirectory, 'asyncapi.tar.gz');
  await checkAndRenameFile(generatedPath, newPath);
}

// async function renameWindows({version, name, sha, arch}) {
//   const dist = 'dist/win32';

//   const generatedPath = path.resolve(dist, `${name}-v${version}-${sha}-${arch}.exe`);
//   const newPath = path.resolve(dist, `asyncapi.${arch}.exe`);
//   await checkAndRenameFile(generatedPath, newPath);
// }

async function renameWindows({version, name, sha, arch}) {
  const dist = 'dist/win32';

  // Ensure directory exists
  await createDirectory(dist);

  const generatedPath = path.resolve(dist, `${name}-v${version}-${sha}-${arch}.exe`);
  const newPath = path.resolve(dist, `asyncapi.${arch}.exe`);
  
  try {
    console.log(`Checking for Windows installer at: ${generatedPath}`);
    
    // Create Windows-specific configuration
    const configDir = path.resolve('dist', 'config');
    await createDirectory(configDir);
    
    // Create installer configuration to use shorter paths
    const winConfig = {
      installPath: 'C:\\AsyncAPI',
      shortPaths: true,
      useShortDirectoryNames: true,
      maxPathLength: 200  // Set a safe path limit
    };
    
    fs.writeFileSync(
      path.resolve(configDir, 'win-install-config.json'), 
      JSON.stringify(winConfig, null, 2)
    );
    
    // Create nsis custom script to handle long paths
    const nsisScript = `
!include LogicLib.nsh
!include FileFunc.nsh

Function HandleLongPaths
  ${If} $INSTDIR == ""
    StrCpy $INSTDIR "C:\\AsyncAPI"
  ${EndIf}
  
  ; Enable long paths in registry
  WriteRegDWORD HKLM "SYSTEM\\CurrentControlSet\\Control\\FileSystem" "LongPathsEnabled" 1
FunctionEnd

!define USE_LONG_PATHS
!define MUI_CUSTOMFUNCTION_GUIINIT HandleLongPaths
`;

    fs.writeFileSync(
      path.resolve(configDir, 'windows-longpaths.nsh'), 
      nsisScript
    );
    
    // Rename the installer if it exists
    if (await fileExists(generatedPath)) {
      console.log(`Found Windows installer, renaming to: ${newPath}`);
      await rename(generatedPath, newPath);
      return true;
    } 
    console.warn(`Warning: Windows installer not found at ${generatedPath}`);
    return false;
  } catch (err) {
    console.error(`Error processing Windows installer: ${err.message}`);
    return false;
  }
}

async function renamePkg({version, name, sha, arch}) {
  const dist = 'dist/macos';

  const generatedPath = path.resolve(dist, `${name}-v${version}-${sha}-${arch}.pkg`);
  const newPath = path.resolve(dist, `asyncapi.${arch}.pkg`);
  await checkAndRenameFile(generatedPath, newPath);
}

async function renamePackages() {
  const version = packageJson.version;
  const name = 'asyncapi';
  const sha = await git.revparse(['--short', 'HEAD']);
  await renameDeb({version: version.split('-')[0], name, sha});
  await renamePkg({version, name, sha, arch: 'x64'});
  await renamePkg({version, name, sha, arch: 'arm64'});
  await renameWindows({version, name, sha, arch: 'x64'});
  await renameWindows({version, name, sha, arch: 'x86'});
  await renameTar({version, name, sha});
}

renamePackages();
