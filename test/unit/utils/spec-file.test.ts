import { expect } from 'chai';
import {
  getSpecFileExtension,
  isAllowedSpecExtension,
} from '../../../src/utils/spec-file';

describe('spec-file utilities', () => {
  describe('getSpecFileExtension()', () => {
    it('should return the last extension for multi-dot filenames', () => {
      expect(getSpecFileExtension('my.asyncapi.yaml')).to.equal('yaml');
    });

    it('should return the extension for simple filenames', () => {
      expect(getSpecFileExtension('asyncapi.json')).to.equal('json');
      expect(getSpecFileExtension('asyncapi.yml')).to.equal('yml');
    });

    it('should return an empty string when no extension is present', () => {
      expect(getSpecFileExtension('asyncapi')).to.equal('');
    });
  });

  describe('isAllowedSpecExtension()', () => {
    it('should accept supported specification extensions', () => {
      expect(isAllowedSpecExtension('yaml')).to.equal(true);
      expect(isAllowedSpecExtension('yml')).to.equal(true);
      expect(isAllowedSpecExtension('json')).to.equal(true);
    });

    it('should reject unsupported extensions', () => {
      expect(isAllowedSpecExtension('asyncapi')).to.equal(false);
      expect(isAllowedSpecExtension('')).to.equal(false);
    });
  });
});
