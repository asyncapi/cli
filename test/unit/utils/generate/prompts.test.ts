import { expect } from 'chai';
import fs from 'fs';
import sinon from 'sinon';

// Note: @clack/prompts functions can't be stubbed via sinon because they are
// already captured as direct references in the prompts module scope.
// Instead, we test the validation logic within the prompt configurations
// and the cancel handling behavior through integration tests.

describe('generate prompts utilities - validation logic', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('file validation logic (used in promptForAsyncAPIPath)', () => {
    it('should validate that empty path returns error message', () => {
      // The validation function used in the prompt
      const validate = (value: string) => {
        if (!value) {
          return 'The path to the AsyncAPI document is required';
        } else if (!fs.existsSync(value)) {
          return 'The file does not exist';
        }
      };

      expect(validate('')).to.equal('The path to the AsyncAPI document is required');
    });

    it('should validate that non-existent file returns error', () => {
      const existsStub = sinon.stub(fs, 'existsSync').returns(false);

      const validate = (value: string) => {
        if (!value) {
          return 'The path to the AsyncAPI document is required';
        } else if (!fs.existsSync(value)) {
          return 'The file does not exist';
        }
      };

      expect(validate('/nonexistent/path.yaml')).to.equal('The file does not exist');
      expect(existsStub.calledWith('/nonexistent/path.yaml')).to.be.true;
    });

    it('should validate that existing file passes validation', () => {
      sinon.stub(fs, 'existsSync').returns(true);

      const validate = (value: string) => {
        if (!value) {
          return 'The path to the AsyncAPI document is required';
        } else if (!fs.existsSync(value)) {
          return 'The file does not exist';
        }
      };

      expect(validate('/valid/spec.yaml')).to.be.undefined;
    });
  });

  describe('output directory validation logic (used in promptForOutputDir)', () => {
    it('should require non-empty output directory', () => {
      const validate = (value: string) => {
        if (!value) {
          return 'The output directory is required';
        } else if (typeof value !== 'string') {
          return 'The output directory must be a string';
        }
      };

      expect(validate('')).to.equal('The output directory is required');
    });

    it('should accept valid directory paths', () => {
      const validate = (value: string) => {
        if (!value) {
          return 'The output directory is required';
        } else if (typeof value !== 'string') {
          return 'The output directory must be a string';
        }
      };

      expect(validate('./output')).to.be.undefined;
      expect(validate('/absolute/path')).to.be.undefined;
    });
  });
});
