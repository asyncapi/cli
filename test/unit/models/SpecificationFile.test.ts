import { expect } from 'chai';
import { Specification } from '../../../src/domains/models/SpecificationFile';

describe('Specification', () => {
  describe('constructor and basic methods', () => {
    it('should create specification from string', () => {
      const spec = new Specification('{"asyncapi": "2.6.0"}');
      expect(spec.text()).to.equal('{"asyncapi": "2.6.0"}');
    });

    it('should store file path when provided', () => {
      const spec = new Specification('test', { filepath: '/path/to/file.yaml' });
      expect(spec.getFilePath()).to.equal('/path/to/file.yaml');
      expect(spec.getKind()).to.equal('file');
    });

    it('should store URL when provided', () => {
      const spec = new Specification('test', { fileURL: 'https://example.com/api.yaml' });
      expect(spec.getFileURL()).to.equal('https://example.com/api.yaml');
      expect(spec.getKind()).to.equal('url');
    });

    it('should return undefined for file path when not set', () => {
      const spec = new Specification('test');
      expect(spec.getFilePath()).to.be.undefined;
    });

    it('should return undefined for URL when not set', () => {
      const spec = new Specification('test');
      expect(spec.getFileURL()).to.be.undefined;
    });

    it('should return undefined for kind when no options provided', () => {
      const spec = new Specification('test');
      expect(spec.getKind()).to.be.undefined;
    });
  });

  describe('toJson', () => {
    it('should parse JSON specification', () => {
      const jsonSpec = JSON.stringify({
        asyncapi: '2.6.0',
        info: { title: 'Test', version: '1.0.0' },
        channels: {},
      });
      const spec = new Specification(jsonSpec);
      const result = spec.toJson();
      expect(result.asyncapi).to.equal('2.6.0');
      expect(result.info.title).to.equal('Test');
    });

    it('should parse YAML specification', () => {
      const yamlSpec = `asyncapi: 2.6.0
info:
  title: Test
  version: "1.0.0"
channels: {}`;
      const spec = new Specification(yamlSpec);
      const result = spec.toJson();
      expect(result.asyncapi).to.equal('2.6.0');
      expect(result.info.title).to.equal('Test');
    });
  });

  describe('isAsyncAPI3', () => {
    it('should return true for AsyncAPI 3.x', () => {
      const spec = new Specification('{"asyncapi": "3.0.0"}');
      expect(spec.isAsyncAPI3()).to.be.true;
    });

    it('should return true for AsyncAPI 3.1.0', () => {
      const spec = new Specification('{"asyncapi": "3.1.0"}');
      expect(spec.isAsyncAPI3()).to.be.true;
    });

    it('should return false for AsyncAPI 2.x', () => {
      const spec = new Specification('{"asyncapi": "2.6.0"}');
      expect(spec.isAsyncAPI3()).to.be.false;
    });
  });

  describe('getSource', () => {
    it('should return file path for file kind', () => {
      const spec = new Specification('test', { filepath: '/path/to/file.yaml' });
      expect(spec.getSource()).to.equal('/path/to/file.yaml');
    });

    it('should return URL for url kind', () => {
      const spec = new Specification('test', { fileURL: 'https://example.com/api.yaml' });
      expect(spec.getSource()).to.equal('https://example.com/api.yaml');
    });

    it('should return undefined when neither is set', () => {
      const spec = new Specification('test');
      expect(spec.getSource()).to.be.undefined;
    });
  });

  describe('toSourceString', () => {
    it('should return File prefix for file kind', () => {
      const spec = new Specification('test', { filepath: '/path/to/file.yaml' });
      expect(spec.toSourceString()).to.equal('File /path/to/file.yaml');
    });

    it('should return URL prefix for url kind', () => {
      const spec = new Specification('test', { fileURL: 'https://example.com/api.yaml' });
      expect(spec.toSourceString()).to.equal('URL https://example.com/api.yaml');
    });
  });
});
