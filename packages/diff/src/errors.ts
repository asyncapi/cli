/**
 * Stable codes for errors thrown by `@asyncapi/diff`.
 * The library does not call `process.exit`. Callers map these onto their own exit codes.
 */
export enum DiffErrorCode {
  /** The two documents use different AsyncAPI major versions. */
  DIFF_VERSION_MISMATCH = 'DIFF_VERSION_MISMATCH',
  /** `config.override` was provided and is not a plain object. */
  DIFF_OVERRIDE_INVALID = 'DIFF_OVERRIDE_INVALID',
}

const VERSION_MISMATCH_MESSAGE = 'diff between different AsyncAPI version is not allowed';
const OVERRIDE_INVALID_MESSAGE = 'Override data must be an object';

/**
 * Thrown when the two documents are different AsyncAPI major versions.
 * Extends `TypeError` so existing `instanceof TypeError` checks keep working.
 */
export class DiffVersionMismatchError extends TypeError {
  readonly code: DiffErrorCode = DiffErrorCode.DIFF_VERSION_MISMATCH;

  constructor() {
    super(VERSION_MISMATCH_MESSAGE);
    Object.setPrototypeOf(this, new.target.prototype);
    // The CLI prints `name: message`. Keep the historical name so that line stays the same.
    this.name = 'TypeError';
  }
}

/**
 * Thrown when override data is present but is not an object.
 * Extends `TypeError` so existing `instanceof TypeError` checks keep working.
 */
export class DiffOverrideInvalidError extends TypeError {
  readonly code: DiffErrorCode = DiffErrorCode.DIFF_OVERRIDE_INVALID;

  constructor() {
    super(OVERRIDE_INVALID_MESSAGE);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'TypeError';
  }
}
