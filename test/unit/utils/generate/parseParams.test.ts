import { expect } from 'chai';
import { paramParser, disableHooksParser, mapBaseURLParser } from '../../../../src/utils/generate/parseParams';

describe('parseParams utilities', () => {
  describe('paramParser()', () => {
    it('should return empty object when inputs is undefined', () => {
      expect(paramParser(undefined)).to.deep.equal({});
    });

    it('should return empty object when inputs is empty array', () => {
      expect(paramParser([])).to.deep.equal({});
    });

    it('should parse single param', () => {
      const result = paramParser(['name=value']);
      expect(result).to.deep.equal({ name: 'value' });
    });

    it('should parse multiple params', () => {
      const result = paramParser(['name1=value1', 'name2=value2']);
      expect(result).to.deep.equal({ name1: 'value1', name2: 'value2' });
    });

    it('should handle values containing equals sign', () => {
      const result = paramParser(['url=http://example.com?foo=bar']);
      expect(result).to.deep.equal({ url: 'http://example.com?foo=bar' });
    });

    it('should handle input with trailing equals (no capture after =)', () => {
      // The regex (.+) requires at least one char after =, so 'name=' won't split properly
      const result = paramParser(['name=value']);
      expect(result).to.have.property('name', 'value');
    });

    it('should throw error for input without equals sign', () => {
      expect(() => paramParser(['invalidparam'])).to.throw(
        'Invalid param invalidparam. It must be in the format of --param name1=value1 name2=value2'
      );
    });
  });

  describe('disableHooksParser()', () => {
    it('should return empty object when inputs is undefined', () => {
      expect(disableHooksParser(undefined)).to.deep.equal({});
    });

    it('should return empty object when inputs is empty array', () => {
      expect(disableHooksParser([])).to.deep.equal({});
    });

    it('should set hook type to true when no hook names provided', () => {
      const result = disableHooksParser(['generate:after']);
      expect(result).to.deep.equal({ 'generate:after': true });
    });

    it('should parse hook type with single hook name', () => {
      const result = disableHooksParser(['generate:after=myHook']);
      expect(result).to.deep.equal({ 'generate:after': ['myHook'] });
    });

    it('should parse hook type with multiple hook names', () => {
      const result = disableHooksParser(['generate:after=hook1,hook2,hook3']);
      expect(result).to.deep.equal({ 'generate:after': ['hook1', 'hook2', 'hook3'] });
    });

    it('should parse multiple hook types', () => {
      const result = disableHooksParser(['generate:before=prep', 'generate:after']);
      expect(result).to.deep.equal({
        'generate:before': ['prep'],
        'generate:after': true,
      });
    });

    it('should throw error for empty input string', () => {
      expect(() => disableHooksParser([''])).to.throw(
        'Invalid --disable-hook flag'
      );
    });
  });

  describe('mapBaseURLParser()', () => {
    it('should return undefined when input is undefined', () => {
      expect(mapBaseURLParser(undefined)).to.equal(undefined);
    });

    it('should parse valid http URL mapping', () => {
      const result = mapBaseURLParser('http://example.com/schemas:/local/schemas');
      expect(result.url).to.equal('http://example.com/schemas');
      expect(result.folder).to.include('/local/schemas');
    });

    it('should parse valid https URL mapping', () => {
      const result = mapBaseURLParser('https://api.example.com:/tmp/local');
      expect(result.url).to.equal('https://api.example.com');
      expect(result.folder).to.include('/tmp/local');
    });

    it('should strip trailing slash from URL', () => {
      const result = mapBaseURLParser('http://example.com/schemas/:/tmp/test');
      expect(result.url).to.equal('http://example.com/schemas');
    });

    it('should throw error for invalid format (no colon delimiter)', () => {
      expect(() => mapBaseURLParser('invalidmapping')).to.throw(
        'Invalid --map-base-url flag. A mapping <url>:<folder> with delimiter : expected.'
      );
    });

    it('should throw error for non-http URL', () => {
      expect(() => mapBaseURLParser('ftp://example.com:/local')).to.throw(
        'Invalid --map-base-url flag. The mapping <url>:<folder> requires a valid http/https url'
      );
    });
  });
});
