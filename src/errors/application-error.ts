import { CliErrorCode, EXIT_CODES } from './error-codes';

export interface ApplicationErrorOptions {
  cause?: unknown;
  details?: unknown;
}

export class ApplicationError extends Error {
  readonly code: CliErrorCode;
  readonly details?: unknown;
  readonly exitCode: number;

  constructor(
    code: CliErrorCode,
    message: string,
    options: ApplicationErrorOptions = {},
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'ApplicationError';
    this.code = code;
    this.exitCode = EXIT_CODES[code];
    this.details = options.details;
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}
