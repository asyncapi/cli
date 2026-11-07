import { expect } from 'chai';
import fs, { promises as fsp } from 'fs';
import sinon from 'sinon';
import { createTempDirectory, removeTempDirectory } from '../../../src/utils/temp-dir';
import { closeStudioServer } from '../../helpers/index';

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

  it('should throw TEMP_DIRECTORY_FAILED when the temp folder cannot be created', async () => {
    const cause = Object.assign(new Error('no space left on device'), { code: 'ENOSPC' });
    const stub = sinon.stub(fsp, 'mkdtemp').rejects(cause);
    try {
      await createTempDirectory();
      expect.fail('should have thrown');
    } catch (e: any) {
      expect(e.code).to.equal('TEMP_DIRECTORY_FAILED');
      expect(e.exitCode).to.equal(37);
      expect(e.message).to.include('no space left on device');
      expect(e.cause).to.equal(cause);
    } finally {
      stub.restore();
    }
  });
});
