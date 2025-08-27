import os from 'os';
import fs, { promises as fsp } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { logger } from './logger';

export function createTempDirectory() {
  return fsp.mkdtemp(path.join(os.tmpdir(), uuidv4()));
}

export async function removeTempDirectory(tmpDir: string) {
  try {
    // eslint-disable-next-line no-unused-expressions
    tmpDir &&
      fs.existsSync(tmpDir) &&
      (await fsp.rm(tmpDir, { recursive: true }));
  } catch (e) {
    logger.error(
      `An error has occurred while removing the temp folder at ${tmpDir}. Please remove it manually. Error: ${e}`,
    );
  }
}
