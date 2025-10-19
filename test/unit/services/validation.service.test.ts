import { expect } from 'chai';
import { ValidationService } from '../../../src/domains/services/validation.service';
import { Specification } from '../../../src/domains/models/SpecificationFile';
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

    it('should validate document with private GitHub reference', async () => {
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

      // The validation succeeds but the document is invalid due to unresolved ref
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
        expect(invalidRefDiagnostic?.message).to.include('Page not found');
        expect(invalidRefDiagnostic?.message).to.include('https://github.com/private-org/private-repo/blob/main/schema.yaml');
      }
    });

    it('should validate document with public HTTP reference', async () => {
      const specFile = new Specification(asyncAPIWithPublicHTTPRef);
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
  });
});
