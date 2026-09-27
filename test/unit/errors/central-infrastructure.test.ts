import { expect } from 'chai';
import { ApplicationError } from '../../../src/errors/application-error';
import { CLI_ERROR_CODES, EXIT_CODES } from '../../../src/errors/error-codes';
import {
  ContextAlreadyExistsError,
  ContextFileEmptyError,
  ContextFileWriteError,
  ContextFileWrongFormatError,
  ContextNotFoundError,
  MissingContextFileError,
  MissingCurrentContextError,
} from '../../../src/errors/context-error';
import {
  DiffBreakingChangeError,
  DiffOverrideFileError,
  DiffOverrideJSONError,
} from '../../../src/errors/diff-error';
import {
  ErrorLoadingSpec,
  SpecificationFileNotFound,
  SpecificationURLNotFound,
  SpecificationWrongFileFormat,
} from '../../../src/errors/specification-file';
import { ValidationError } from '../../../src/errors/validation-error';
import { mapError } from '../../../src/apps/cli/internal/output/error-mapper';
import {
  isStructuredOutput,
  structuredSuccess,
} from '../../../src/apps/cli/internal/output/types';

describe('central error and output infrastructure', () => {
  describe('error code registry', () => {
    it('maps a representative code for every documented exit value', () => {
      const representatives: Array<[keyof typeof CLI_ERROR_CODES, number]> = [
        ['INTERNAL_ERROR', 1],
        ['DOCUMENT_PARSE_FAILED', 10],
        ['SCHEMA_VALIDATION_FAILED', 11],
        ['REFERENCE_RESOLUTION_FAILED', 12],
        ['DOCUMENT_FORMAT_UNSUPPORTED', 13],
        ['DOCUMENT_VERSION_UNSUPPORTED', 14],
        ['DIAGNOSTICS_FORMAT_INVALID', 15],
        ['DIFF_OVERRIDE_INVALID', 16],
        ['BREAKING_CHANGES_DETECTED', 17],
        ['TEMPLATE_NOT_FOUND', 20],
        ['GENERATION_FAILED', 21],
        ['GENERATION_LANGUAGE_UNSUPPORTED', 22],
        ['TEMPLATE_DOCUMENT_VERSION_UNSUPPORTED', 23],
        ['GENERATOR_PARAMETER_INVALID', 24],
        ['GENERATION_OUTPUT_UNSAFE', 25],
        ['GENERATOR_REGISTRY_INVALID', 26],
        ['GENERATED_REFERENCE_READ_FAILED', 27],
        ['FILE_NOT_FOUND', 30],
        ['FILE_PERMISSION_DENIED', 31],
        ['FILE_ALREADY_EXISTS', 32],
        ['FILE_EXTENSION_UNSUPPORTED', 33],
        ['FILE_READ_FAILED', 34],
        ['FILE_WRITE_FAILED', 35],
        ['FILE_SERIALIZATION_FAILED', 36],
        ['TEMP_DIRECTORY_FAILED', 37],
        ['CONNECTION_FAILED', 40],
        ['NETWORK_TIMEOUT', 41],
        ['PROXY_ERROR', 42],
        ['HTTP_RESPONSE_ERROR', 43],
        ['REMOTE_REFERENCE_FETCH_FAILED', 44],
        ['REGISTRY_AUTH_REQUIRED', 45],
        ['STUDIO_INSTALL_DOWNLOAD_FAILED', 46],
        ['CLI_ARGUMENT_REQUIRED', 50],
        ['CLI_FLAG_INVALID', 51],
        ['CLI_OPTIONS_CONFLICT', 52],
        ['CONTEXT_FILE_NOT_FOUND', 53],
        ['CONTEXT_FILE_INVALID', 54],
        ['CONTEXT_NOT_FOUND', 55],
        ['CURRENT_CONTEXT_NOT_SET', 56],
        ['CONFIG_READ_FAILED', 57],
        ['CONFIG_WRITE_FAILED', 58],
        ['STUDIO_INSTALL_DECLINED', 59],
        ['SERVER_PORT_IN_USE', 60],
        ['SERVER_START_FAILED', 61],
        ['STUDIO_RUNTIME_UNAVAILABLE', 62],
        ['PREVIEW_BUNDLE_FAILED', 63],
        ['WATCH_SOURCE_REMOVED', 64],
        ['WEBSOCKET_PROTOCOL_ERROR', 65],
        ['DEPENDENCY_ERROR', 90],
        ['INTERNAL_STATE_ERROR', 91],
        ['INTERNAL_CONFIGURATION_ERROR', 92],
        ['COMMAND_NOT_FOUND', 127],
        ['INTERRUPTED', 130],
      ];

      for (const [code, exitCode] of representatives) {
        expect(EXIT_CODES[CLI_ERROR_CODES[code]], code).to.equal(exitCode);
      }
      expect(Object.keys(EXIT_CODES)).to.have.members(Object.values(CLI_ERROR_CODES));
    });
  });

  describe('ApplicationError', () => {
    it('carries its stable code, exit code, details, and cause', () => {
      const cause = new Error('parser failed');
      const details = { line: 4 };
      const error = new ApplicationError(
        CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED,
        'Invalid document',
        { cause, details },
      );

      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(ApplicationError);
      expect(error.name).to.equal('ApplicationError');
      expect(error.message).to.equal('Invalid document');
      expect(error.code).to.equal('DOCUMENT_PARSE_FAILED');
      expect(error.exitCode).to.equal(10);
      expect(error.details).to.equal(details);
      expect((error as Error & { cause?: unknown }).cause).to.equal(cause);
    });

    it('does not add a cause when one is not supplied', () => {
      const error = new ApplicationError(CLI_ERROR_CODES.INTERNAL_ERROR, 'Failed');

      expect(error).not.to.have.own.property('cause');
      expect(error.details).to.equal(undefined);
    });
  });

  describe('structured output', () => {
    it('creates an exact four-field success envelope', () => {
      const output = structuredSuccess('Completed', { value: 1 });

      expect(output).to.deep.equal({
        status: 'success',
        message: 'Completed',
        data: { value: 1 },
        errors: [],
      });
      expect(Object.keys(output)).to.have.members(['status', 'message', 'data', 'errors']);
      expect(Object.keys(output)).to.have.length(4);
      expect(isStructuredOutput(output)).to.equal(true);
    });

    it('creates an exact four-field warning envelope with no errors', () => {
      const output = structuredSuccess('Completed with warnings', { warnings: [] }, 'warning');

      expect(output).to.deep.equal({
        status: 'warning',
        message: 'Completed with warnings',
        data: { warnings: [] },
        errors: [],
      });
      expect(Object.keys(output)).to.have.length(4);
    });

    it('recognizes only values containing all four envelope fields', () => {
      expect(isStructuredOutput({ status: 'error', message: 'Failed', data: null, errors: [] })).to.equal(true);
      expect(isStructuredOutput({ status: 'error', message: 'Failed', data: null })).to.equal(false);
      expect(isStructuredOutput(null)).to.equal(false);
    });
  });

  describe('mapError()', () => {
    it('returns an ApplicationError unchanged', () => {
      const error = new ApplicationError(CLI_ERROR_CODES.CLI_FLAG_INVALID, 'Bad flag');

      expect(mapError(error)).to.equal(error);
    });

    it('maps all native filesystem and network codes', () => {
      const cases = [
        ['ENOENT', CLI_ERROR_CODES.FILE_NOT_FOUND],
        ['EACCES', CLI_ERROR_CODES.FILE_PERMISSION_DENIED],
        ['EPERM', CLI_ERROR_CODES.FILE_PERMISSION_DENIED],
        ['EEXIST', CLI_ERROR_CODES.FILE_ALREADY_EXISTS],
        ['ETIMEDOUT', CLI_ERROR_CODES.NETWORK_TIMEOUT],
        ['ESOCKETTIMEDOUT', CLI_ERROR_CODES.NETWORK_TIMEOUT],
        ['ECONNREFUSED', CLI_ERROR_CODES.CONNECTION_FAILED],
        ['ECONNRESET', CLI_ERROR_CODES.CONNECTION_FAILED],
        ['ENOTFOUND', CLI_ERROR_CODES.CONNECTION_FAILED],
        ['EAI_AGAIN', CLI_ERROR_CODES.CONNECTION_FAILED],
      ] as const;

      for (const [nativeCode, expectedCode] of cases) {
        const source = Object.assign(new Error(nativeCode), { code: nativeCode });
        const mapped = mapError(source);

        expect(mapped.code, nativeCode).to.equal(expectedCode);
        expect(mapped.message, nativeCode).to.equal(nativeCode);
        expect((mapped as Error & { cause?: unknown }).cause, nativeCode).to.equal(source);
      }
    });

    it('maps all current Optimizer package codes and preserves structural details', () => {
      const cases = [
        ['OPTIMIZER_INPUT_INVALID', CLI_ERROR_CODES.DOCUMENT_SYNTAX_INVALID],
        ['OPTIMIZER_DOCUMENT_PARSE_FAILED', CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED],
        ['OPTIMIZER_SERIALIZATION_FAILED', CLI_ERROR_CODES.FILE_SERIALIZATION_FAILED],
        ['OPTIMIZER_REPORT_NOT_GENERATED', CLI_ERROR_CODES.INTERNAL_STATE_ERROR],
      ] as const;

      for (const [packageCode, expectedCode] of cases) {
        const details = { packageCode };
        const source = { code: packageCode, message: 'Optimizer failed', details };
        const mapped = mapError(source);

        expect(mapped.code, packageCode).to.equal(expectedCode);
        expect(mapped.details, packageCode).to.equal(details);
        expect((mapped as Error & { cause?: unknown }).cause, packageCode).to.equal(source);
      }
    });

    it('maps forward-compatible Diff and Bundler codes from structural errors', () => {
      const cases = [
        ['DIFF_VERSION_MISMATCH', CLI_ERROR_CODES.DIFF_VERSION_MISMATCH],
        ['DIFF_OVERRIDE_INVALID', CLI_ERROR_CODES.DIFF_OVERRIDE_INVALID],
        ['DIFF_COMPARISON_FAILED', CLI_ERROR_CODES.DEPENDENCY_ERROR],
        ['BUNDLER_INPUT_INVALID', CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED],
        ['BUNDLER_DOCUMENT_PARSE_FAILED', CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED],
        ['BUNDLER_VERSION_MISMATCH', CLI_ERROR_CODES.DOCUMENT_VERSION_UNSUPPORTED],
        ['BUNDLER_REFERENCE_RESOLUTION_FAILED', CLI_ERROR_CODES.REFERENCE_RESOLUTION_FAILED],
        ['BUNDLER_FAILED', CLI_ERROR_CODES.DEPENDENCY_ERROR],
      ] as const;

      for (const [packageCode, expectedCode] of cases) {
        const mapped = mapError({ code: packageCode, message: `${packageCode} failed` });
        expect(mapped.code, packageCode).to.equal(expectedCode);
      }
    });

    it('maps existing typed domain errors', () => {
      const cases: Array<[Error, string]> = [
        [new DiffOverrideFileError(), CLI_ERROR_CODES.OVERRIDE_FILE_NOT_FOUND],
        [new DiffOverrideJSONError(), CLI_ERROR_CODES.DIFF_OVERRIDE_INVALID],
        [new DiffBreakingChangeError(), CLI_ERROR_CODES.BREAKING_CHANGES_DETECTED],
        [new SpecificationFileNotFound('missing.yaml'), CLI_ERROR_CODES.SPEC_FILE_NOT_FOUND],
        [new SpecificationWrongFileFormat('bad.txt'), CLI_ERROR_CODES.DOCUMENT_FORMAT_UNSUPPORTED],
        [new SpecificationURLNotFound('https://example.com/spec'), CLI_ERROR_CODES.URL_FETCH_FAILED],
        [new ContextAlreadyExistsError('local', 'contexts.json'), CLI_ERROR_CODES.CONTEXT_ALREADY_EXISTS],
        [new ContextNotFoundError('local'), CLI_ERROR_CODES.CONTEXT_NOT_FOUND],
        [new MissingCurrentContextError(), CLI_ERROR_CODES.CURRENT_CONTEXT_NOT_SET],
        [new MissingContextFileError(), CLI_ERROR_CODES.CONTEXT_FILE_NOT_FOUND],
        [new ContextFileWrongFormatError('contexts.json'), CLI_ERROR_CODES.CONTEXT_FILE_INVALID],
        [new ContextFileEmptyError('contexts.json'), CLI_ERROR_CODES.CONTEXT_FILE_EMPTY],
        [new ContextFileWriteError('contexts.json'), CLI_ERROR_CODES.CONFIG_WRITE_FAILED],
        [new ErrorLoadingSpec('url', 'https://example.com/spec'), CLI_ERROR_CODES.URL_FETCH_FAILED],
        [new ErrorLoadingSpec('context', 'local'), CLI_ERROR_CODES.CONTEXT_NOT_FOUND],
        [new ErrorLoadingSpec('invalid file'), CLI_ERROR_CODES.FILE_EXTENSION_UNSUPPORTED],
        [new ErrorLoadingSpec('file', 'missing.yaml'), CLI_ERROR_CODES.SPEC_FILE_NOT_FOUND],
        [new ValidationError({ type: 'invalid-syntax-file', filepath: 'bad.yaml' }), CLI_ERROR_CODES.DOCUMENT_SYNTAX_INVALID],
        [new ValidationError({ type: 'no-spec-found' }), CLI_ERROR_CODES.SPEC_FILE_NOT_FOUND],
        [new ValidationError({ type: 'parser-error', err: { title: 'Parser rejected it' } }), CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED],
      ];

      for (const [source, expectedCode] of cases) {
        const mapped = mapError(source);
        expect(mapped.code, source.constructor.name).to.equal(expectedCode);
        expect((mapped as Error & { cause?: unknown }).cause, source.constructor.name).to.equal(source);
      }
    });

    it('retains legacy message mappings and falls back to INTERNAL_ERROR', () => {
      const cases = [
        ['documents use different AsyncAPI versions', CLI_ERROR_CODES.DIFF_VERSION_MISMATCH],
        ['input is already a JSON document', CLI_ERROR_CODES.DOCUMENT_ALREADY_IN_TARGET_FORMAT],
        ['cannot downgrade to an older version', CLI_ERROR_CODES.CONVERSION_DOWNGRADE_UNSUPPORTED],
        ['proxy connection failed', CLI_ERROR_CODES.PROXY_ERROR],
        ['request timed out', CLI_ERROR_CODES.NETWORK_TIMEOUT],
        ['template was not found', CLI_ERROR_CODES.TEMPLATE_NOT_FOUND],
        ['unsupported model language', CLI_ERROR_CODES.GENERATION_LANGUAGE_UNSUPPORTED],
        ['breaking changes detected', CLI_ERROR_CODES.BREAKING_CHANGES_DETECTED],
        ['missing required argument', CLI_ERROR_CODES.CLI_ARGUMENT_REQUIRED],
        ['invalid flag value', CLI_ERROR_CODES.CLI_FLAG_VALUE_INVALID],
        ['unclassified failure', CLI_ERROR_CODES.INTERNAL_ERROR],
      ] as const;

      for (const [message, expectedCode] of cases) {
        expect(mapError(new Error(message)).code, message).to.equal(expectedCode);
      }
    });
  });
});
