/**
 * Error handling utilities for consistent error management across the CLI and API.
 * Provides type-safe error handling and standardized error messages.
 */

/**
 * Extracts a safe error message from any caught error.
 * Handles various error types including Error objects, strings, and unknown types.
 *
 * @param error - The caught error (can be any type)
 * @param fallbackMessage - Default message if error cannot be parsed
 * @returns A string error message
 *
 * @example
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const message = getErrorMessage(error, 'Operation failed');
 *   console.error(message);
 * }
 */
export function getErrorMessage(error: unknown, fallbackMessage = 'An unknown error occurred'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return fallbackMessage;
}

/**
 * Extracts the error stack trace if available.
 *
 * @param error - The caught error
 * @returns Stack trace string or undefined
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Type guard to check if a value is an Error instance.
 *
 * @param value - Value to check
 * @returns True if value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if an error has a specific code property.
 * Useful for Node.js system errors (ENOENT, EACCES, etc.)
 *
 * @param error - The error to check
 * @param code - The error code to match
 * @returns True if error has the specified code
 *
 * @example
 * try {
 *   await fs.readFile(path);
 * } catch (error) {
 *   if (hasErrorCode(error, 'ENOENT')) {
 *     console.log('File not found');
 *   }
 * }
 */
export function hasErrorCode(error: unknown, code: string): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: unknown }).code === code
  );
}

/**
 * Wraps an async function to catch and transform errors.
 * Useful for standardizing error handling in command handlers.
 *
 * @param fn - Async function to wrap
 * @param errorHandler - Function to handle caught errors
 * @returns Wrapped function
 *
 * @example
 * const safeRun = withErrorHandling(
 *   async () => await riskyOperation(),
 *   (error) => console.error('Failed:', getErrorMessage(error))
 * );
 */
export function withErrorHandling<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  errorHandler: (error: unknown) => void
): (...args: Args) => Promise<T | undefined> {
  return async (...args: Args): Promise<T | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler(error);
      return undefined;
    }
  };
}

/**
 * Creates a typed error result for service functions.
 * Alternative to throwing errors - returns a result object instead.
 */
export interface ErrorResult {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface SuccessResult<T> {
  success: true;
  data: T;
}

export type Result<T> = SuccessResult<T> | ErrorResult;

/**
 * Creates a success result.
 */
export function success<T>(data: T): SuccessResult<T> {
  return { success: true, data };
}

/**
 * Creates an error result.
 */
export function failure(error: string, code?: string, details?: Record<string, unknown>): ErrorResult {
  return { success: false, error, code, details };
}

/**
 * Creates an error result from a caught error.
 */
export function failureFromError(
  error: unknown,
  fallbackMessage = 'An unknown error occurred'
): ErrorResult {
  return {
    success: false,
    error: getErrorMessage(error, fallbackMessage),
    details: isError(error) ? { stack: error.stack } : undefined,
  };
}

