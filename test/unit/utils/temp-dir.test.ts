import { expect } from 'chai';
import fs from 'fs';
import { createTempDirectory, removeTempDirectory } from '../../../src/utils/temp-dir';

describe('createTempDirectory() & removeTempDirectory()', () => {
  it('should create and then remove temp folder', async () => {
    // create dir
    const tempDir = await createTempDirectory();
    expect(fs.existsSync(tempDir)).to.equal(true);

    // remove dir
    await removeTempDirectory(tempDir);
    expect(fs.existsSync(tempDir)).to.equal(false);
  });
});
