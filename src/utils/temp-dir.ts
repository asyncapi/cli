import os from 'os';
import fs, { promises as fsp } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { logger } from './logger';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';
import { getErrorMessage } from './error-handler';

export async function createTempDirectory(): Promise<string> {
  const prefix = path.join(os.tmpdir(), uuidv4());
  try {
    return await fsp.mkdtemp(prefix);
  } catch (error: unknown) {
    throw new ApplicationError(
      CLI_ERROR_CODES.TEMP_DIRECTORY_FAILED,
      `Failed to create temporary directory in ${os.tmpdir()}: ${getErrorMessage(error)}`,
      { cause: error, details: { prefix } },
    );
  }
}

export async function removeTempDirectory(tmpDir: string) {
  try {
    if (tmpDir && fs.existsSync(tmpDir)) {
      await fsp.rm(tmpDir, { recursive: true });
    }
  } catch (e) {
    logger.error(
      `An error has occurred while removing the temp folder at ${tmpDir}. Please remove it manually. Error: ${e}`,
    );
  }
}
