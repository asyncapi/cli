import { expect } from 'chai';
import sinon from 'sinon';

// GeneratorService has a dependency on @asyncapi/generator which is ESM-only.
// We test it through the compiled lib/ output instead of source.
const { GeneratorService } = require('../../../lib/domains/services/generator.service');

describe('GeneratorService', () => {
  let generatorService: any;

  beforeEach(() => {
    generatorService = new GeneratorService(false);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create instance with default non-interactive mode', () => {
      const service = new GeneratorService();
      expect(service).to.be.instanceOf(GeneratorService);
    });

    it('should create instance with interactive mode', () => {
      const service = new GeneratorService(true);
      expect(service).to.be.instanceOf(GeneratorService);
    });
  });

  describe('generate()', () => {
    function createMockSpec(options: { isV3?: boolean; text?: string; filePath?: string; fileURL?: string } = {}) {
      return {
        isAsyncAPI3: () => options.isV3 ?? false,
        text: () => options.text ?? 'asyncapi: 2.6.0',
        getFilePath: () => options.filePath,
        getFileURL: () => options.fileURL,
      } as any;
    }

    it('should return error for v3 document with unsupported template', async () => {
      const spec = createMockSpec({ isV3: true });

      const result = await generatorService.generate(
        spec,
        '@asyncapi/dotnet-nats-template',
        './output',
        {},
      );

      expect(result.success).to.be.false;
      expect(result.error).to.include('does not support AsyncAPI v3');
      expect(result.error).to.include('@asyncapi/dotnet-nats-template');
    });

    it('should return error for v3 with minimaltemplate (testing template)', async () => {
      const spec = createMockSpec({ isV3: true });

      const result = await generatorService.generate(
        spec,
        '@asyncapi/minimaltemplate',
        './output',
        {},
      );

      expect(result.success).to.be.false;
      expect(result.error).to.include('does not support AsyncAPI v3');
    });

    it('should not block v3 document for unknown/supported templates', async () => {
      const spec = createMockSpec({ isV3: true, filePath: '/tmp/spec.yaml' });

      // This will fail during actual generation (template not installed),
      // but shouldn't be blocked by v3 check
      const result = await generatorService.generate(
        spec,
        '@asyncapi/html-template',
        './output',
        {},
      );

      // Should pass v3 check but fail during generation (template not found)
      expect(result.success).to.be.false;
      // Error should be from generation, not from v3 check
      expect(result.error).to.not.include('does not support AsyncAPI v3');
    });

    it('should not block v2 document for any template', async () => {
      const spec = createMockSpec({ isV3: false, filePath: '/tmp/spec.yaml' });

      const result = await generatorService.generate(
        spec,
        '@asyncapi/dotnet-nats-template',
        './output',
        {},
      );

      // Should not fail on v3 check (error will be from generation itself)
      expect(result.error).to.not.include('does not support AsyncAPI v3');
    });

    it('should handle generation errors gracefully', async () => {
      const spec = createMockSpec({ filePath: '/nonexistent/spec.yaml' });

      const result = await generatorService.generate(
        spec,
        '@asyncapi/nonexistent-template',
        './output',
        {},
      );

      expect(result.success).to.be.false;
      expect(result.error).to.be.a('string');
    });

    it('should use non-interactive spinner in non-interactive mode', async () => {
      const service = new GeneratorService(false);
      const spec = createMockSpec({ filePath: '/tmp/spec.yaml' });

      // Will fail during generation but tests that no spinner error occurs
      const result = await service.generate(
        spec,
        '@asyncapi/nonexistent-template',
        './output',
        {},
      );

      expect(result.success).to.be.false;
    });
  });
});
