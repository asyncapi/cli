import { expect } from 'chai';
import fs from 'fs';
import { createTempDirectory, removeTempDirectory } from '../../../src/utils/temp-dir';
import { closeStudioServer } from '../../helpers';

describe('createTempDirectory() & removeTempDirectory()', () => {
  after(async () => {
    await closeStudioServer();
    await closeStudioServer(4321);
  });
  it('should create and then remove temp folder', async () => {
    // create dir
    const tempDir = await createTempDirectory();
    expect(fs.existsSync(tempDir)).to.equal(true);

    // remove dir
    await removeTempDirectory(tempDir);
    expect(fs.existsSync(tempDir)).to.equal(false);
  });
});
