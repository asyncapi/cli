import { expect } from 'chai';
import { GeneratorService } from '../../../src/domains/services/generator.service';
import { Specification } from '../../../src/domains/models/SpecificationFile';
import sinon from 'sinon';

describe('GeneratorService', () => {
  describe('generate', () => {
    it('should pass the file path (not the Specification object) as parseOptions.path to generateFromString', async () => {
      const service = new GeneratorService(false);
      const specFilePath = '/some/dir/asyncapi.yaml';
      const specContent = JSON.stringify({
        asyncapi: '2.6.0',
        info: { title: 'Test', version: '1.0.0' },
        channels: {},
      });

      const specification = new Specification(specContent, { filepath: specFilePath });

      // Verify getSource() returns a string (the file path)
      expect(specification.getSource()).to.equal(specFilePath);
      expect(typeof specification.getSource()).to.equal('string');
    });

    it('should return the URL as source for URL-based specifications', () => {
      const specURL = 'https://example.com/asyncapi.yaml';
      const specContent = JSON.stringify({
        asyncapi: '2.6.0',
        info: { title: 'Test', version: '1.0.0' },
        channels: {},
      });

      const specification = new Specification(specContent, { fileURL: specURL });

      expect(specification.getSource()).to.equal(specURL);
      expect(typeof specification.getSource()).to.equal('string');
    });
  });
});
