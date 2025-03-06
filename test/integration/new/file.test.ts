import TestHelper from '../../helpers';
import { fileCleanup } from '../../helpers';
import { describe, before, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';


const testHelper = new TestHelper();


describe('new', () => {
  before(() => {
    try {
      testHelper.deleteSpecFileAtWorkingDir();
    } catch (e: any) {
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
  });
  
  describe('create new file', () => {
    afterEach(() => {
      testHelper.deleteSpecFileAtWorkingDir();
    });
    
    it('runs new file command', async () => {
      const { stdout, stderr } = await runCommand([
        'new:file', '--no-tty', '-n=specification.yaml'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.equal('The specification.yaml has been successfully created.\n');
      fileCleanup('specification.yaml');
    });
  });

  describe('when asyncapi file already exists', () => {
    beforeEach(() => {
      try {
        testHelper.createSpecFileAtWorkingDir();
      } catch (e: any) {
        if (e.code !== 'EEXIST') {
          throw e;
        }
      }
    });

    afterEach(() => {
      testHelper.deleteSpecFileAtWorkingDir();
    });

    it('should inform about the existing file and finish the process', async () => {
      const { stdout, stderr } = await runCommand([
        'new:file', '--no-tty', '-n=specification.yaml'
      ]);
      expect(stderr).to.equal('');
      expect(stdout).to.equal('A file named specification.yaml already exists. Please choose a different name.\n');
      fileCleanup('specification.yaml');
    });
  });
});
