/**
 * Stable, machine-readable error codes for `@asyncapi/optimizer` (v2+).
 *
 * These are library-owned codes. Callers (e.g. the AsyncAPI CLI `optimize` command) map them onto their own
 * process exit codes / output envelope. The library itself never calls `process.exit`.
 *
 * @public
 */
export enum OptimizerErrorCode {
  /** The input was neither an object nor a YAML/JSON string. */
  INPUT_INVALID = 'OPTIMIZER_INPUT_INVALID',
  /** The AsyncAPI parser could not produce a document from the input. */
  DOCUMENT_PARSE_FAILED = 'OPTIMIZER_DOCUMENT_PARSE_FAILED',
  /** `getOptimizedDocument()` was called before `getReport()`. */
  REPORT_NOT_GENERATED = 'OPTIMIZER_REPORT_NOT_GENERATED',
  /** The optimized document could not be serialized to JSON or YAML. */
  SERIALIZATION_FAILED = 'OPTIMIZER_SERIALIZATION_FAILED',
}

/**
 * Optional structured context carried by an {@link OptimizerError}.
 * @public
 */
export interface OptimizerErrorOptions {
  /** Structured, non-secret context (e.g. parser diagnostics). */
  details?: unknown
  /** The underlying error, if any. */
  cause?: unknown
}

/**
 * Base class for every error thrown by `@asyncapi/optimizer`.
 * Carries a stable {@link OptimizerErrorCode} plus optional structured `details`.
 * @public
 */
export class OptimizerError extends Error {
  readonly code: OptimizerErrorCode
  readonly details?: unknown

  constructor(code: OptimizerErrorCode, message: string, options: OptimizerErrorOptions = {}) {
    super(message)
    // Restore the prototype chain (required when extending built-ins under ES6 targets).
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = new.target.name
    this.code = code
    this.details = options.details
    if (options.cause !== undefined) {
      ;(this as { cause?: unknown }).cause = options.cause
    }
  }
}

/** Thrown when the input is not a valid AsyncAPI object/string. Code: `OPTIMIZER_INPUT_INVALID`. @public */
export class OptimizerInputError extends OptimizerError {}

/** Thrown when the AsyncAPI parser cannot produce a document. Code: `OPTIMIZER_DOCUMENT_PARSE_FAILED`. @public */
export class OptimizerParseError extends OptimizerError {}

/** Thrown when `getOptimizedDocument()` is called before `getReport()`. Code: `OPTIMIZER_REPORT_NOT_GENERATED`. @public */
export class OptimizerStateError extends OptimizerError {}

/** Thrown when the optimized document cannot be serialized. Code: `OPTIMIZER_SERIALIZATION_FAILED`. @public */
export class OptimizerSerializationError extends OptimizerError {}
