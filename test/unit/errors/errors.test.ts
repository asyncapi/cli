import { expect } from 'chai';
import {
  MissingContextFileError,
  MissingCurrentContextError,
  ContextNotFoundError,
  ContextAlreadyExistsError,
  ContextFileWrongFormatError,
  ContextFileEmptyError,
  ContextFileWriteError,
  NO_CONTEXTS_SAVED,
} from '../../../src/errors/context-error';
import {
  DiffOverrideFileError,
  DiffOverrideJSONError,
  DiffBreakingChangeError,
} from '../../../src/errors/diff-error';
import { GeneratorError } from '../../../src/errors/generator-error';
import {
  SpecificationFileNotFound,
  SpecificationWrongFileFormat,
  SpecificationURLNotFound,
  ErrorLoadingSpec,
} from '../../../src/errors/specification-file';
import { ValidationError } from '../../../src/errors/validation-error';

describe('Error classes', () => {
  describe('Context errors', () => {
    it('MissingContextFileError should have correct message', () => {
      const err = new MissingContextFileError();
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.equal(NO_CONTEXTS_SAVED);
      expect(err.name).to.equal('ContextError');
    });

    it('MissingCurrentContextError should have correct message', () => {
      const err = new MissingCurrentContextError();
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.include('No context is set as current');
    });

    it('ContextNotFoundError should include context name', () => {
      const err = new ContextNotFoundError('myContext');
      expect(err.message).to.include('myContext');
      expect(err.message).to.include('does not exist');
    });

    it('ContextAlreadyExistsError should include context name and file', () => {
      const err = new ContextAlreadyExistsError('myContext', '.asyncapi');
      expect(err.message).to.include('myContext');
      expect(err.message).to.include('.asyncapi');
      expect(err.message).to.include('already exists');
    });

    it('ContextFileWrongFormatError should include file name', () => {
      const err = new ContextFileWrongFormatError('.asyncapi');
      expect(err.message).to.include('.asyncapi');
      expect(err.message).to.include('wrong format');
    });

    it('ContextFileEmptyError should include file name', () => {
      const err = new ContextFileEmptyError('.asyncapi');
      expect(err.message).to.include('.asyncapi');
      expect(err.message).to.include('empty');
    });

    it('ContextFileWriteError should include file name', () => {
      const err = new ContextFileWriteError('.asyncapi');
      expect(err.message).to.include('.asyncapi');
      expect(err.message).to.include('Error writing');
    });
  });

  describe('Diff errors', () => {
    it('DiffOverrideFileError should have correct name and message', () => {
      const err = new DiffOverrideFileError();
      expect(err).to.be.instanceOf(Error);
      expect(err.name).to.equal('DiffOverrideFileError');
      expect(err.message).to.equal('Override file not found');
    });

    it('DiffOverrideJSONError should have correct name and message', () => {
      const err = new DiffOverrideJSONError();
      expect(err.name).to.equal('DiffOverrideJSONError');
      expect(err.message).to.include('not a valid JSON file');
    });

    it('DiffBreakingChangeError should have correct name and message', () => {
      const err = new DiffBreakingChangeError();
      expect(err.name).to.equal('DiffBreakingChangeError');
      expect(err.message).to.equal('Breaking changes detected');
    });
  });

  describe('Generator errors', () => {
    it('GeneratorError should wrap original error message', () => {
      const original = new Error('template not found');
      const err = new GeneratorError(original);
      expect(err).to.be.instanceOf(Error);
      expect(err.name).to.equal('Generator Error');
      expect(err.message).to.equal('template not found');
    });
  });

  describe('Specification file errors', () => {
    it('SpecificationFileNotFound should include file path', () => {
      const err = new SpecificationFileNotFound('/path/to/spec.yaml');
      expect(err).to.be.instanceOf(Error);
      expect(err.name).to.equal('SpecificationFileError');
      expect(err.message).to.include('/path/to/spec.yaml');
      expect(err.message).to.include('does not exist');
    });

    it('SpecificationFileNotFound should have generic message without path', () => {
      const err = new SpecificationFileNotFound();
      expect(err.message).to.include('could not find any AsyncAPI file');
    });

    it('SpecificationWrongFileFormat should include file path', () => {
      const err = new SpecificationWrongFileFormat('/path/to/bad.txt');
      expect(err.message).to.include('/path/to/bad.txt');
      expect(err.message).to.include('not of correct format');
    });

    it('SpecificationURLNotFound should include URL', () => {
      const err = new SpecificationURLNotFound('https://example.com/spec.yaml');
      expect(err.message).to.include('https://example.com/spec.yaml');
      expect(err.message).to.include('Unable to fetch');
    });

    describe('ErrorLoadingSpec', () => {
      it('should handle "file" source', () => {
        const err = new ErrorLoadingSpec('file', '/path/to/spec.yaml');
        expect(err.name).to.include('from file');
        expect(err.message).to.include('/path/to/spec.yaml');
        expect(err.message).to.include('does not exist');
      });

      it('should handle "url" source', () => {
        const err = new ErrorLoadingSpec('url', 'https://example.com/spec.yaml');
        expect(err.name).to.include('from url');
        expect(err.message).to.include('Failed to download');
      });

      it('should handle "context" source', () => {
        const err = new ErrorLoadingSpec('context', 'myContext');
        expect(err.name).to.include('from context');
        expect(err.message).to.include('myContext');
        expect(err.message).to.include('does not exist');
      });

      it('should handle "invalid file" source', () => {
        const err = new ErrorLoadingSpec('invalid file');
        expect(err.name).to.include('Invalid AsyncAPI file type');
        expect(err.message).to.include('yml');
      });

      it('should handle undefined source (default)', () => {
        const err = new ErrorLoadingSpec();
        expect(err.name).to.include('error locating AsyncAPI document');
        expect(err.message).to.equal(NO_CONTEXTS_SAVED);
      });
    });
  });

  describe('Validation errors', () => {
    it('should handle invalid-file type', () => {
      const err = new ValidationError({ type: 'invalid-file', filepath: 'nonexistent.yaml' });
      expect(err).to.be.instanceOf(Error);
      expect(err.name).to.equal('ValidationError');
      expect(err.message).to.include('nonexistent.yaml');
    });

    it('should handle invalid-syntax-file type', () => {
      const err = new ValidationError({ type: 'invalid-syntax-file', filepath: 'bad.yaml' });
      expect(err.message).to.include('Syntax Error');
      expect(err.message).to.include('bad.yaml');
    });

    it('should handle no-spec-found type', () => {
      const err = new ValidationError({ type: 'no-spec-found' });
      expect(err.message).to.include('Unable to perform validation');
    });

    it('should handle parser-error with title', () => {
      const err = new ValidationError({
        type: 'parser-error',
        err: { title: 'Parse failed' },
      });
      expect(err.message).to.include('Parse failed');
    });

    it('should handle parser-error with validation errors including location', () => {
      const err = new ValidationError({
        type: 'parser-error',
        err: {
          validationErrors: [
            { title: 'Bad field', location: { startLine: 10, startColumn: 5 } },
            { title: 'Missing prop' },
            { location: { startLine: 20, startColumn: 1 } },
          ],
        },
      });
      expect(err.message).to.include('Bad field 10:5');
      expect(err.message).to.include('Missing prop');
      expect(err.message).to.include('20:1');
    });

    it('should handle parser-error with empty validation errors', () => {
      const err = new ValidationError({
        type: 'parser-error',
        err: { validationErrors: [] },
      });
      expect(err.message).to.equal('');
    });
  });
});
