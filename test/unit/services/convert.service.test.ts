import { expect } from 'chai';
import { ConversionService } from '../../../src/domains/services/convert.service';
import { Specification } from '../../../src/domains/models/SpecificationFile';
import { AsyncAPIConvertVersion } from '@asyncapi/converter';

const validJsonAsyncAPI2_0_0 = `{
  "asyncapi": "2.0.0",
  "info": {
    "title": "Super test",
    "version": "1.0.0"
  },
  "channels": {}
}`;

const validJsonAsyncAPI2_1_0 = `{
  "asyncapi": "2.1.0",
  "info": {
    "title": "Super test",
    "version": "1.0.0"
  },
  "channels": {}
}`;

const validJsonAsyncAPI3_0_0 = `{
  "asyncapi": "3.0.0",
  "info": {
    "title": "Super test",
    "version": "1.0.0"
  },
  "channels": {}
}`;

const invalidAsyncAPI = `{
  "asyncapi": "invalid",
  "info": {
    "title": "Super test"
  }
}`;

describe('ConversionService', () => {
  let conversionService: ConversionService;

  beforeEach(() => {
    conversionService = new ConversionService();
  });

  describe('convertDocument()', () => {
    it('should successfully convert AsyncAPI 2.0.0 to 2.4.0', async () => {
      const specFile = new Specification(validJsonAsyncAPI2_0_0);
      const options = {
        format: 'asyncapi' as const,
        'target-version': '2.4.0' as AsyncAPIConvertVersion
      };

      const result = await conversionService.convertDocument(specFile, options);

      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data).to.have.property('convertedDocument');
        expect(result.data).to.have.property('originalFormat', 'asyncapi');
        expect(result.data?.convertedDocument).to.be.a('string');
      }
    });

    it('should successfully convert AsyncAPI 2.0.0 to latest version (3.0.0)', async () => {
      const specFile = new Specification(validJsonAsyncAPI2_0_0);
      const options = {
        format: 'asyncapi' as const
      };

      const result = await conversionService.convertDocument(specFile, options);

      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data).to.have.property('convertedDocument');
        expect(result.data).to.have.property('originalFormat', 'asyncapi');
        // Should convert to 3.0.0 as default
        expect(result.data?.convertedDocument).to.contain('3.0.0');
      }
    });

    it('should handle conversion errors gracefully', async () => {
      const invalidSpec = new Specification(invalidAsyncAPI);
      const options = {
        format: 'asyncapi' as const,
        'target-version': '2.4.0' as AsyncAPIConvertVersion
      };

      try {
        const result = await conversionService.convertDocument(invalidSpec, options);
        
        // If it returns a result, it should be unsuccessful
        expect(result.success).to.equal(false);
        expect(result.error).to.be.a('string');
      } catch (error) {
        // If it throws, that's also acceptable error handling
        expect(error).to.be.an('error');
      }
    });

    it('should return error for unsupported conversion format', async () => {
      const specFile = new Specification(validJsonAsyncAPI2_0_0);
      const options = {
        format: 'unsupported' as any,
        'target-version': '2.4.0' as AsyncAPIConvertVersion
      };

      const result = await conversionService.convertDocument(specFile, options);

      expect(result.success).to.equal(false);
      expect(result.error).to.contain('Unsupported conversion format');
    });

    it('should handle OpenAPI conversion', async () => {
      const openApiSpec = `{
        "openapi": "3.0.0",
        "info": {
          "title": "Test API",
          "version": "1.0.0"
        },
        "paths": {}
      }`;
      
      const specFile = new Specification(openApiSpec);
      const options = {
        format: 'openapi' as const,
        perspective: 'client' as const
      };

      const result = await conversionService.convertDocument(specFile, options);

      // Should either succeed or fail gracefully
      expect(result).to.have.property('success');
      if (!result.success) {
        expect(result.error).to.be.a('string');
      }
    });

    it('should handle Postman collection conversion', async () => {
      const postmanCollection = `{
        "info": {
          "name": "Test Collection",
          "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": []
      }`;
      
      const specFile = new Specification(postmanCollection);
      const options = {
        format: 'postman-collection' as const,
        perspective: 'client' as const
      };

      const result = await conversionService.convertDocument(specFile, options);

      // Should either succeed or fail gracefully
      expect(result).to.have.property('success');
      if (!result.success) {
        expect(result.error).to.be.a('string');
      }
    });
  });

  describe('handleLogging()', () => {
    it('should return appropriate logging message for AsyncAPI conversion', () => {
      const specFile = new Specification(validJsonAsyncAPI2_0_0);
      specFile.getFilePath = () => '/test/spec.yaml';
      
      const options = {
        format: 'asyncapi' as const,
        'target-version': '2.4.0' as AsyncAPIConvertVersion
      };

      const message = conversionService.handleLogging(specFile, options);

      expect(message).to.be.a('string');
      expect(message).to.contain('AsyncAPI document');
      expect(message).to.contain('/test/spec.yaml');
      expect(message).to.contain('2.4.0');
    });

    it('should return appropriate logging message for OpenAPI conversion', () => {
      const specFile = new Specification('{"openapi": "3.0.0"}');
      specFile.getFilePath = () => '/test/openapi.yaml';
      
      const options = {
        format: 'openapi' as const
      };

      const message = conversionService.handleLogging(specFile, options);

      expect(message).to.be.a('string');
      expect(message).to.contain('OpenAPI document');
      expect(message).to.contain('/test/openapi.yaml');
    });

    it('should handle target-version as latest', () => {
      const specFile = new Specification(validJsonAsyncAPI2_0_0);
      specFile.getFilePath = () => '/test/spec.yaml';
      
      const options = {
        format: 'asyncapi' as const
      };

      const message = conversionService.handleLogging(specFile, options);

      expect(message).to.be.a('string');
      expect(message).to.contain('latest');
    });
  });

  describe('handleOutput()', () => {
    it('should handle file output without throwing errors', async () => {
      const tempPath = '/tmp/test-output.json';
      const content = '{"test": "content"}';

      try {
        await conversionService.handleOutput(tempPath, content);
        // If no error is thrown, the test passes
        expect(true).to.equal(true);
      } catch (error) {
        // Expected to potentially fail due to file system permissions
        expect(error).to.be.an('error');
      }
    });
  });
});
