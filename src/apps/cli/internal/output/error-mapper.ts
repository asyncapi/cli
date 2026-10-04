import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES, CliErrorCode } from '@errors/error-codes';
import {
  ContextAlreadyExistsError,
  ContextFileEmptyError,
  ContextFileWrongFormatError,
  ContextFileWriteError,
  ContextNotFoundError,
  MissingContextFileError,
  MissingCurrentContextError,
} from '@errors/context-error';
import {
  DiffBreakingChangeError,
  DiffOverrideFileError,
  DiffOverrideJSONError,
} from '@errors/diff-error';
import {
  ErrorLoadingSpec,
  SpecificationFileNotFound,
  SpecificationURLNotFound,
  SpecificationWrongFileFormat,
} from '@errors/specification-file';
import { ValidationError } from '@errors/validation-error';
import { GeneratorError } from '@errors/generator-error';
import { getErrorMessage, hasErrorCode } from '@utils/error-handler';

const PACKAGE_ERROR_CODES: Record<string, CliErrorCode> = {
  OPTIMIZER_INPUT_INVALID: CLI_ERROR_CODES.DOCUMENT_SYNTAX_INVALID,
  OPTIMIZER_DOCUMENT_PARSE_FAILED: CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED,
  OPTIMIZER_SERIALIZATION_FAILED: CLI_ERROR_CODES.FILE_SERIALIZATION_FAILED,
  OPTIMIZER_REPORT_NOT_GENERATED: CLI_ERROR_CODES.INTERNAL_STATE_ERROR,
  DIFF_VERSION_MISMATCH: CLI_ERROR_CODES.DIFF_VERSION_MISMATCH,
  DIFF_OVERRIDE_INVALID: CLI_ERROR_CODES.DIFF_OVERRIDE_INVALID,
  DIFF_COMPARISON_FAILED: CLI_ERROR_CODES.DEPENDENCY_ERROR,
  BUNDLER_INPUT_INVALID: CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED,
  BUNDLER_DOCUMENT_PARSE_FAILED: CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED,
  BUNDLER_VERSION_MISMATCH: CLI_ERROR_CODES.DOCUMENT_VERSION_UNSUPPORTED,
  BUNDLER_REFERENCE_RESOLUTION_FAILED: CLI_ERROR_CODES.REFERENCE_RESOLUTION_FAILED,
  BUNDLER_FAILED: CLI_ERROR_CODES.DEPENDENCY_ERROR,
};

function packageCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

function fromCode(code: CliErrorCode, error: unknown): ApplicationError {
  const details = error && typeof error === 'object' && 'details' in error
    ? (error as { details?: unknown }).details
    : undefined;
  return new ApplicationError(code, getErrorMessage(error), {
    cause: error,
    details,
  });
}

// Centralizing classification keeps dependency-specific heuristics out of commands.
// eslint-disable-next-line sonarjs/cognitive-complexity
export function mapError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  const dependencyCode = packageCode(error);
  if (dependencyCode && PACKAGE_ERROR_CODES[dependencyCode]) {
    return fromCode(PACKAGE_ERROR_CODES[dependencyCode], error);
  }

  if (hasErrorCode(error, 'ENOENT')) {
    return fromCode(CLI_ERROR_CODES.FILE_NOT_FOUND, error);
  }
  if (hasErrorCode(error, 'EACCES') || hasErrorCode(error, 'EPERM')) {
    return fromCode(CLI_ERROR_CODES.FILE_PERMISSION_DENIED, error);
  }
  if (hasErrorCode(error, 'EEXIST')) {
    return fromCode(CLI_ERROR_CODES.FILE_ALREADY_EXISTS, error);
  }
  if (hasErrorCode(error, 'EADDRINUSE')) {
    return fromCode(CLI_ERROR_CODES.SERVER_PORT_IN_USE, error);
  }
  if (hasErrorCode(error, 'ETIMEDOUT') || hasErrorCode(error, 'ESOCKETTIMEDOUT')) {
    return fromCode(CLI_ERROR_CODES.NETWORK_TIMEOUT, error);
  }
  if (
    hasErrorCode(error, 'ECONNREFUSED') ||
    hasErrorCode(error, 'ECONNRESET') ||
    hasErrorCode(error, 'ENOTFOUND') ||
    hasErrorCode(error, 'EAI_AGAIN')
  ) {
    return fromCode(CLI_ERROR_CODES.CONNECTION_FAILED, error);
  }

  if (error instanceof DiffOverrideFileError) {
    return fromCode(CLI_ERROR_CODES.OVERRIDE_FILE_NOT_FOUND, error);
  }
  if (error instanceof DiffOverrideJSONError) {
    return fromCode(CLI_ERROR_CODES.DIFF_OVERRIDE_INVALID, error);
  }
  if (error instanceof DiffBreakingChangeError) {
    return fromCode(CLI_ERROR_CODES.BREAKING_CHANGES_DETECTED, error);
  }
  if (error instanceof SpecificationFileNotFound) {
    return fromCode(CLI_ERROR_CODES.SPEC_FILE_NOT_FOUND, error);
  }
  if (error instanceof SpecificationWrongFileFormat) {
    return fromCode(CLI_ERROR_CODES.DOCUMENT_FORMAT_UNSUPPORTED, error);
  }
  if (error instanceof SpecificationURLNotFound) {
    return fromCode(CLI_ERROR_CODES.URL_FETCH_FAILED, error);
  }
  if (error instanceof ContextAlreadyExistsError) {
    return fromCode(CLI_ERROR_CODES.CONTEXT_ALREADY_EXISTS, error);
  }
  if (error instanceof ContextNotFoundError) {
    return fromCode(CLI_ERROR_CODES.CONTEXT_NOT_FOUND, error);
  }
  if (error instanceof MissingCurrentContextError) {
    return fromCode(CLI_ERROR_CODES.CURRENT_CONTEXT_NOT_SET, error);
  }
  if (error instanceof MissingContextFileError) {
    return fromCode(CLI_ERROR_CODES.CONTEXT_FILE_NOT_FOUND, error);
  }
  if (error instanceof ContextFileWrongFormatError) {
    return fromCode(CLI_ERROR_CODES.CONTEXT_FILE_INVALID, error);
  }
  if (error instanceof ContextFileEmptyError) {
    return fromCode(CLI_ERROR_CODES.CONTEXT_FILE_EMPTY, error);
  }
  if (error instanceof ContextFileWriteError) {
    return fromCode(CLI_ERROR_CODES.CONFIG_WRITE_FAILED, error);
  }

  // Strip ANSI color codes so colored messages classify the same as plain ones.
  // eslint-disable-next-line no-control-regex
  const message = getErrorMessage(error).replace(/\u001b\[[0-9;]*m/g, '');
  if (error instanceof ErrorLoadingSpec) {
    if (error.name.includes('url')) {
      return fromCode(CLI_ERROR_CODES.URL_FETCH_FAILED, error);
    }
    if (error.name.includes('context')) {
      return fromCode(CLI_ERROR_CODES.CONTEXT_NOT_FOUND, error);
    }
    if (error.name.includes('Invalid')) {
      return fromCode(CLI_ERROR_CODES.FILE_EXTENSION_UNSUPPORTED, error);
    }
    return fromCode(CLI_ERROR_CODES.SPEC_FILE_NOT_FOUND, error);
  }
  if (error instanceof ValidationError) {
    if ((/syntax error/i).test(message)) {
      return fromCode(CLI_ERROR_CODES.DOCUMENT_SYNTAX_INVALID, error);
    }
    if ((/no file|no spec|unable to perform validation/i).test(message)) {
      return fromCode(CLI_ERROR_CODES.SPEC_FILE_NOT_FOUND, error);
    }
    return fromCode(CLI_ERROR_CODES.DOCUMENT_PARSE_FAILED, error);
  }
  if (error instanceof GeneratorError) {
    return fromCode(CLI_ERROR_CODES.GENERATION_FAILED, error);
  }

  if ((/doesn't exist in the OpenAPI document/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.INTERNAL_CONFIGURATION_ERROR, error);
  }
  if ((/different asyncapi version|different versions/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.DIFF_VERSION_MISMATCH, error);
  }
  if ((/already a (json|yaml)|already.*target/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.DOCUMENT_ALREADY_IN_TARGET_FORMAT, error);
  }
  if ((/downgrad|older version/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.CONVERSION_DOWNGRADE_UNSUPPORTED, error);
  }
  if ((/must be provided when using --proxy(Host|Port)/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.PROXY_CONFIGURATION_INVALID, error);
  }
  if ((/proxy/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.PROXY_ERROR, error);
  }
  if ((/timed? ?out|timeout/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.NETWORK_TIMEOUT, error);
  }
  if ((/template.*not (found|exist)|could not find.*template/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.TEMPLATE_NOT_FOUND, error);
  }
  if ((/unsupported.*language/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.GENERATION_LANGUAGE_UNSUPPORTED, error);
  }
  if ((/breaking changes detected/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.BREAKING_CHANGES_DETECTED, error);
  }
  if ((/required.*argument|missing.*required|no file specified/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.CLI_ARGUMENT_REQUIRED, error);
  }
  if ((/expected an integer|expected .* to be an integer/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.CLI_INTEGER_INVALID, error);
  }
  if ((/cannot also be provided when using|exclusive/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.CLI_OPTIONS_CONFLICT, error);
  }
  if ((/nonexistent flag|unexpected argument/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.CLI_FLAG_INVALID, error);
  }
  if ((/expected .* to be one of|invalid flag|flag .* expects a value/i).test(message)) {
    return fromCode(CLI_ERROR_CODES.CLI_FLAG_VALUE_INVALID, error);
  }

  return fromCode(CLI_ERROR_CODES.INTERNAL_ERROR, error);
}
