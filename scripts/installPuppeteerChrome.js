const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer').default || require('puppeteer');
const { Browser, detectBrowserPlatform, install } = require('@puppeteer/browsers');
const { PUPPETEER_REVISIONS } = require('puppeteer-core/internal/revisions.js');

async function installBrowserForCi() {
  if (!process.env.CI) {
    return;
  }

  const cacheDir = puppeteer.configuration.cacheDirectory;
  const browserCacheDir = path.join(cacheDir, 'chrome');

  try {
    fs.rmSync(browserCacheDir, { recursive: true, force: true });
  } catch {
    // Ignore cache cleanup errors and attempt a fresh install.
  }

  const platform = detectBrowserPlatform();
  if (!platform) {
    throw new Error('Unsupported platform for Puppeteer browser installation.');
  }

  const buildId =
    puppeteer.configuration.chrome?.version || PUPPETEER_REVISIONS.chrome;

  await install({
    browser: Browser.CHROME,
    cacheDir,
    platform,
    buildId,
  });
}

installBrowserForCi().catch((error) => {
  console.error(error);
  process.exit(1);
});
