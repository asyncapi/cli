import { expect } from 'chai';
import { applyProxyToPath, buildProxyUrl } from '../../../src/utils/proxy';

describe('proxy utilities', () => {
  describe('applyProxyToPath()', () => {
    it('should append proxy URL when both host and port provided', () => {
      const result = applyProxyToPath('./asyncapi.yaml', 'localhost', '8080');
      expect(result).to.equal('./asyncapi.yaml+http://localhost:8080');
    });

    it('should work with numeric port', () => {
      const result = applyProxyToPath('./spec.yml', 'proxy.example.com', 3128);
      expect(result).to.equal('./spec.yml+http://proxy.example.com:3128');
    });

    it('should return original path when no proxy host', () => {
      const result = applyProxyToPath('./asyncapi.yaml', undefined, '8080');
      expect(result).to.equal('./asyncapi.yaml');
    });

    it('should return original path when no proxy port', () => {
      const result = applyProxyToPath('./asyncapi.yaml', 'localhost', undefined);
      expect(result).to.equal('./asyncapi.yaml');
    });

    it('should return original path when neither host nor port provided', () => {
      const result = applyProxyToPath('./asyncapi.yaml');
      expect(result).to.equal('./asyncapi.yaml');
    });

    it('should return undefined when filePath is undefined', () => {
      const result = applyProxyToPath(undefined, 'localhost', '8080');
      expect(result).to.equal(undefined);
    });

    it('should return undefined when filePath is empty string (falsy)', () => {
      const result = applyProxyToPath('', 'localhost', '8080');
      expect(result).to.equal('');
    });

    it('should handle URL-style file paths', () => {
      const result = applyProxyToPath('https://example.com/spec.yaml', 'proxy.local', '9090');
      expect(result).to.equal('https://example.com/spec.yaml+http://proxy.local:9090');
    });
  });

  describe('buildProxyUrl()', () => {
    it('should build proxy URL from host and port', () => {
      expect(buildProxyUrl('localhost', '8080')).to.equal('http://localhost:8080');
    });

    it('should work with numeric port', () => {
      expect(buildProxyUrl('proxy.example.com', 3128)).to.equal('http://proxy.example.com:3128');
    });

    it('should return undefined when host is missing', () => {
      expect(buildProxyUrl(undefined, '8080')).to.equal(undefined);
    });

    it('should return undefined when port is missing', () => {
      expect(buildProxyUrl('localhost', undefined)).to.equal(undefined);
    });

    it('should return undefined when both are missing', () => {
      expect(buildProxyUrl(undefined, undefined)).to.equal(undefined);
    });
  });
});
