export const BundlerErrorCode = {
  INPUT_INVALID: 'BUNDLER_INPUT_INVALID',
  DOCUMENT_PARSE_FAILED: 'BUNDLER_DOCUMENT_PARSE_FAILED',
  VERSION_MISMATCH: 'BUNDLER_VERSION_MISMATCH',
  REFERENCE_RESOLUTION_FAILED: 'BUNDLER_REFERENCE_RESOLUTION_FAILED',
} as const;

export type BundlerErrorCode = typeof BundlerErrorCode[keyof typeof BundlerErrorCode];

export class ParserError extends Error {
  readonly code: BundlerErrorCode;

  constructor({ type, title, code }: { type: string; title: string; code: BundlerErrorCode }) {
    super();
    Object.setPrototypeOf(this, new.target.prototype);
    this.message = title;
    this.name = type;
    this.code = code;
  }
}

export function versionMismatchError(message: string): Error {
  const error = new Error(message);
  Object.defineProperty(error, 'code', {
    value: BundlerErrorCode.VERSION_MISMATCH,
    enumerable: true,
  });
  return error;
}

export function markReferenceError(err: unknown): unknown {
  if (err && typeof err === 'object') {
    Object.defineProperty(err, 'code', {
      value: BundlerErrorCode.REFERENCE_RESOLUTION_FAILED,
      enumerable: true,
      configurable: true,
    });
  }
  return err;
}
