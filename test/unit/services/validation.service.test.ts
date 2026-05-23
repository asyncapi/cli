import { expect } from 'chai';
import { ValidationService, convertGitHubWebUrl } from '../../../src/domains/services/validation.service';
import { Specification, fileExists } from '../../../src/domains/models/SpecificationFile';
import { ConfigService } from '../../../src/domains/services/config.service';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const validAsyncAPI = `{
  "asyncapi": "2.6.0",
  "info": {
    "title": "Test Service",
    "version": "1.0.0"
  },
  "channels": {}
}`;

const invalidAsyncAPI = `{
  "asyncapi": "2.6.0",
  "info": {
    "title": "Test Service"
  },
  "channels": {}
}`;

const completelyInvalidDocument = `{
  "not": "asyncapi",
  "document": true
}`;

// Test AsyncAPI documents with external references
const asyncAPIWithPrivateGitHubRef = `{
  "asyncapi": "2.6.0",
  "info": {
    "title": "Test Service with Private GitHub Ref",
    "version": "1.0.0"
  },
  "channels": {
    "user/private": {
      "publish": {
        "message": {
          "payload": {
            "$ref": "https://github.com/private-org/private-repo/blob/main/schema.yaml#/payload"
          }
        }
      }
    }
  }
}`;

const asyncAPIWithPublicHTTPRef = `{
  "asyncapi": "2.6.0",
  "info": {
    "title": "Test Service with Public HTTP Ref",
    "version": "1.0.0"
  },
  "channels": {
    "user/event": {
      "publish": {
        "message": {
          "payload": {
            "$ref": "https://raw.githubusercontent.com/asyncapi/spec/master/examples/streetlights.yml#/channels/light/measured/message/payload"
          }
        }
      }
    }
  }
}`;

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('validateDocument()', () => {
    it('should validate a valid AsyncAPI document', async () => {
      const specFile = new Specification(validAsyncAPI);
      const options = {
        'diagnostics-format': 'stylish' as const
      };

      const result = await validationService.validateDocument(specFile, options);

      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data).to.have.property('status');
        expect(result.data).to.have.property('diagnostics');
        expect(result.data?.diagnostics).to.be.an('array');
      }
    });

    it('should detect errors in invalid AsyncAPI document', async () => {
      const specFile = new Specification(invalidAsyncAPI);
      const options = {
        'diagnostics-format': 'stylish' as const
      };

      const result = await validationService.validateDocument(specFile, options);

      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data).to.have.property('status');
        expect(result.data).to.have.property('diagnostics');
        expect(result.data?.diagnostics).to.be.an('array');
        
        // Should have diagnostics for missing required fields
        if (result.data?.diagnostics && result.data.diagnostics.length > 0) {
          expect(result.data.diagnostics.some((d: any) => d.message)).to.equal(true);
        }
      }
    });

    it('should handle completely invalid documents', async () => {
      const specFile = new Specification(completelyInvalidDocument);
      const options = {
        'diagnostics-format': 'stylish' as const
      };

      const result = await validationService.validateDocument(specFile, options);
      
      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data).to.have.property('diagnostics');
        expect(result.data?.diagnostics).to.be.an('array');
      }
    });

    it('should handle different output formats', async () => {
      const specFile = new Specification(validAsyncAPI);
      const formats = ['json', 'junit', 'html', 'text', 'teamcity', 'pretty'] as const;

      for (const format of formats) {
        const options = { 'diagnostics-format': format };
        const result = await validationService.validateDocument(specFile, options);
        
        expect(result.success).to.equal(true);
        if (result.success) {
          expect(result.data).to.have.property('diagnostics');
        }
      }
    });

    it('should handle validation with output file', async () => {
      const specFile = new Specification(validAsyncAPI);
      const options = {
        'diagnostics-format': 'json' as const,
        output: '/tmp/validation-output.json'
      };

      const result = await validationService.validateDocument(specFile, options);

      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data).to.have.property('diagnostics');
      }
    });

    it('should handle malformed JSON', async () => {
      const specFile = new Specification('{ invalid json }');
      const options = {
        'diagnostics-format': 'stylish' as const
      };

      const result = await validationService.validateDocument(specFile, options);

      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data).to.have.property('diagnostics');
        expect(result.data?.diagnostics).to.be.an('array');
      }
    });
  });

  describe('validateDocument() with external URLs', () => {
    let originalConfig: any;
    const CONFIG_DIR = path.join(os.homedir(), '.asyncapi');
    const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

    beforeEach(async () => {
      // Backup original config
      try {
        const content = await fs.readFile(CONFIG_FILE, 'utf8');
        originalConfig = JSON.parse(content);
      } catch (err) {
        originalConfig = null;
      }
    });

    afterEach(async () => {
      // Restore original config
      if (originalConfig) {
        await fs.writeFile(CONFIG_FILE, JSON.stringify(originalConfig, null, 2), 'utf8');
      } else {
        try {
          await fs.unlink(CONFIG_FILE);
        } catch (err) {
          // File doesn't exist, ignore
        }
      }
    });

    it('should fail to validate document with private GitHub reference when not properly configured', async () => {
      // Ensure no auth config exists for private GitHub repository
      try {
        await fs.unlink(CONFIG_FILE);
      } catch (err) {
        // File doesn't exist, ignore
      }

      const specFile = new Specification(asyncAPIWithPrivateGitHubRef);
      const options = {
        'diagnostics-format': 'stylish' as const
      };

      const result = await validationService.validateDocument(specFile, options);

      // The validation succeeds means the validation command is successfully executed it is independent whether 
      // the document is valid or not 
      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data).to.have.property('status');
        expect(result.data?.status).to.equal('invalid');
        expect(result.data).to.have.property('diagnostics');
        expect(result.data?.diagnostics).to.be.an('array');
        
        // Should have an invalid-ref diagnostic for the private GitHub URL
        const invalidRefDiagnostic = result.data?.diagnostics?.find((d: any) => d.code === 'invalid-ref');
        // eslint-disable-next-line no-unused-expressions
        expect(invalidRefDiagnostic).to.exist;
        // Error message varies by platform - macOS shows FetchError, Linux/Windows show "Page not found"
        expect(invalidRefDiagnostic?.message).to.satisfy((msg: string) => 
          msg.includes('Page not found') || msg.includes('FetchError')
        );
        expect(invalidRefDiagnostic?.message).to.include('https://github.com/private-org/private-repo/blob/main/schema.yaml');
      }
    });

    it('should validate document with public HTTP reference', async () => {
      const specFile = new Specification(asyncAPIWithPublicHTTPRef);
      const options = {
        'diagnostics-format': 'stylish' as const
      };

      const result = await validationService.validateDocument(specFile, options);
      // The validation succeeds means the validation command is successfully executed it is independent whether 
      // the document is valid or not 
      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data).to.have.property('status');
        expect(result.data).to.have.property('diagnostics');
        expect(result.data?.diagnostics).to.be.an('array');
      }
    });
  });

  describe('convertGitHubWebUrl()', () => {
    it('should correctly convert branch with no slash', () => {
      const result = convertGitHubWebUrl('https://github.com/asyncapi/cli/blob/master/package.json');
      expect(result).to.equal('https://raw.githubusercontent.com/asyncapi/cli/master/package.json');
    });

    it('should correctly convert branch with slashes', () => {
      const result = convertGitHubWebUrl('https://github.com/asyncapi/cli/blob/feature/new-validation/src/specs/spec.yaml');
      expect(result).to.equal('https://raw.githubusercontent.com/asyncapi/cli/feature/new-validation/src/specs/spec.yaml');
    });

    it('should correctly convert commit SHA URLs', () => {
      const result = convertGitHubWebUrl('https://github.com/asyncapi/cli/blob/fe44dba1ba07b964f20dcb9a6b006ae9d61c1ec9/spec.yaml');
      expect(result).to.equal('https://raw.githubusercontent.com/asyncapi/cli/fe44dba1ba07b964f20dcb9a6b006ae9d61c1ec9/spec.yaml');
    });

    it('should ignore non-github blob URLs', () => {
      const result = convertGitHubWebUrl('https://other.com/asyncapi/cli/blob/master/spec.yaml');
      expect(result).to.equal('https://other.com/asyncapi/cli/blob/master/spec.yaml');
    });
  });

  describe('fileExists()', () => {
    it('should return true for valid files that exist', async () => {
      const tempFile = path.join(os.tmpdir(), 'valid.asyncapi.yaml');
      await fs.writeFile(tempFile, 'asyncapi: 2.0.0', 'utf8');
      try {
        const exists = await fileExists(tempFile);
        expect(exists).to.equal(true);
      } finally {
        await fs.unlink(tempFile).catch(() => {});
      }
    });

    it('should extract correct extension from multi-dot file names that are directories', async () => {
      const tempDirYaml = path.join(os.tmpdir(), 'my.asyncapi.yaml');
      const tempDirJson = path.join(os.tmpdir(), 'my.spec.json');
      await fs.mkdir(tempDirYaml, { recursive: true });
      await fs.mkdir(tempDirJson, { recursive: true });
      
      try {
        try {
          await fileExists(tempDirYaml);
          expect.fail('Should have failed');
        } catch (err: any) {
          expect(err.name).to.equal('error loading AsyncAPI document from file');
        }

        try {
          await fileExists(tempDirJson);
          expect.fail('Should have failed');
        } catch (err: any) {
          expect(err.name).to.equal('error loading AsyncAPI document from file');
        }
      } finally {
        await fs.rmdir(tempDirYaml).catch(() => {});
        await fs.rmdir(tempDirJson).catch(() => {});
      }
    });

    it('should throw invalid file error for invalid extensions on directories', async () => {
      const tempDirTxt = path.join(os.tmpdir(), 'my.asyncapi.txt');
      await fs.mkdir(tempDirTxt, { recursive: true });

      try {
        await fileExists(tempDirTxt);
        expect.fail('Should have failed');
      } catch (err: any) {
        expect(err.name).to.equal('Invalid AsyncAPI file type');
        expect(err.message).to.equal('cli only supports yml ,yaml ,json extension');
      } finally {
        await fs.rmdir(tempDirTxt).catch(() => {});
      }
    });

    it('should throw invalid file error for directories with no extension', async () => {
      const tempDirNoExt = path.join(os.tmpdir(), 'asyncapi_noext');
      await fs.mkdir(tempDirNoExt, { recursive: true });

      try {
        await fileExists(tempDirNoExt);
        expect.fail('Should have failed');
      } catch (err: any) {
        expect(err.name).to.equal('Invalid AsyncAPI file type');
        expect(err.message).to.equal('cli only supports yml ,yaml ,json extension');
      } finally {
        await fs.rmdir(tempDirNoExt).catch(() => {});
      }
    });
  });
});
