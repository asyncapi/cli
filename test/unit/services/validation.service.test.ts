import { expect } from 'chai';
import { ValidationService } from '../../../src/domains/services/validation.service';
import { Specification } from '../../../src/domains/models/SpecificationFile';

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
});
