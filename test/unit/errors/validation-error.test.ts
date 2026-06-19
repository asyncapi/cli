import { expect } from 'chai';
import { ValidationError } from '../../../src/errors/validation-error';

describe('ValidationError', () => {
  describe('type: parser-error', () => {
    it('formats validationErrors with title and location', () => {
      const error = new ValidationError({
        type: 'parser-error',
        err: {
          title: 'Validation failed',
          validationErrors: [
            { title: 'Missing required field', location: { startLine: 3, startColumn: 5 } },
            { title: 'Invalid type' },
          ],
        },
      });

      expect(error.message).to.contain('Validation failed');
      expect(error.message).to.contain('Missing required field 3:5');
      expect(error.message).to.contain('Invalid type');
    });

    it('falls back to the string err itself when no ParserError fields are present', () => {
      // Validation service returns errors as plain strings (e.g. "Failed to
      // parse document"). Without the fallback, buildError produced an empty
      // message and the user saw a bare "ValidationError:" with no body.
      const error = new ValidationError({
        type: 'parser-error',
        err: 'Failed to parse document',
      });

      expect(error.message).to.equal('Failed to parse document');
    });

    it('falls back to err.message for generic Error objects', () => {
      const inner = new Error('Something went wrong');
      const error = new ValidationError({
        type: 'parser-error',
        err: inner,
      });

      expect(error.message).to.equal('Something went wrong');
    });

    it('falls back to a sentinel string when err is undefined', () => {
      const error = new ValidationError({
        type: 'parser-error',
        err: undefined,
      });

      expect(error.message).to.equal('Unknown parser error');
    });

    it('falls back to err.title for objects without validationErrors', () => {
      const error = new ValidationError({
        type: 'parser-error',
        err: { title: 'A short title' },
      });

      expect(error.message).to.equal('A short title');
    });
  });

  describe('type: invalid-file', () => {
    it('renders the file-not-found message and ignores err', () => {
      const error = new ValidationError({
        type: 'invalid-file',
        filepath: '/tmp/missing.yaml',
        err: { title: 'should not appear' },
      });

      expect(error.message).to.equal(
        'There is no file or context with name "/tmp/missing.yaml".',
      );
    });
  });

  describe('type: invalid-syntax-file', () => {
    it('renders the syntax error template', () => {
      const error = new ValidationError({
        type: 'invalid-syntax-file',
        filepath: '/tmp/bad.yaml',
      });

      expect(error.message).to.equal('Syntax Error in "/tmp/bad.yaml".');
    });
  });
});
