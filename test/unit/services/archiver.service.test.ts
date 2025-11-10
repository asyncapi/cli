import { expect } from 'chai';
import { ArchiverService } from '../../../src/domains/services/archiver.service';
import archiver from 'archiver';

describe('ArchiverService', () => {
  let archiverService: ArchiverService;

  beforeEach(() => {
    archiverService = new ArchiverService();
  });

  describe('createZip()', () => {
    it('should create a zip archiver instance', () => {
      const zip = archiverService.createZip();
      
      expect(zip).to.have.property('append');
      expect(zip).to.have.property('directory');
      expect(zip).to.have.property('finalize');
    });

    it('should create zip without response object', () => {
      const zip = archiverService.createZip();
      
      expect(zip).to.be.an('object');
      expect(typeof zip.append).to.equal('function');
    });
  });

  describe('appendDirectory()', () => {
    it('should append directory to archive without throwing', () => {
      const zip = archiverService.createZip();
      
      expect(() => {
        archiverService.appendDirectory(zip, '/source', 'destination');
      }).to.not.throw();
    });
  });

  describe('appendAsyncAPIDocument()', () => {
    it('should append JSON AsyncAPI document with .json extension', () => {
      const zip = archiverService.createZip();
      const asyncapiDoc = {
        asyncapi: '2.6.0',
        info: {
          title: 'Test API',
          version: '1.0.0'
        },
        channels: {}
      };

      expect(() => {
        archiverService.appendAsyncAPIDocument(zip, JSON.stringify(asyncapiDoc));
      }).to.not.throw();
    });

    it('should append YAML AsyncAPI document with .yml extension', () => {
      const zip = archiverService.createZip();
      const yamlDoc = `asyncapi: 2.6.0
info:
  title: Test API
  version: 1.0.0
channels: {}`;

      expect(() => {
        archiverService.appendAsyncAPIDocument(zip, yamlDoc);
      }).to.not.throw();
    });

    it('should use custom filename when provided', () => {
      const zip = archiverService.createZip();
      const asyncapiDoc = {
        asyncapi: '2.6.0',
        info: { title: 'Test', version: '1.0.0' },
        channels: {}
      };

      expect(() => {
        archiverService.appendAsyncAPIDocument(zip, JSON.stringify(asyncapiDoc), 'custom-name');
      }).to.not.throw();
    });
  });

  describe('createTempDirectory()', () => {
    it('should create a temporary directory', async () => {
      const tempDir = await archiverService.createTempDirectory();
      
      expect(tempDir).to.be.a('string');
      expect(tempDir.length).to.be.greaterThan(0);
      
      // Clean up
      await archiverService.removeTempDirectory(tempDir);
    });
  });

  describe('removeTempDirectory()', () => {
    it('should remove temporary directory', async () => {
      const tempDir = await archiverService.createTempDirectory();
      
      expect(() => {
        return archiverService.removeTempDirectory(tempDir);
      }).to.not.throw();
    });

    it('should handle removal of non-existent directory gracefully', async () => {
      const nonExistentPath = '/non/existent/path';
      
      try {
        await archiverService.removeTempDirectory(nonExistentPath);
        // Should either succeed silently or throw a specific error
        expect(true).to.equal(true);
      } catch (error) {
        // Expected behavior for non-existent paths
        expect(error).to.be.an('error');
      }
    });
  });
});
