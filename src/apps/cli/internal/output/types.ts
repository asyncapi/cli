import type { CliErrorCode } from '@errors/error-codes';

export type StructuredStatus = 'success' | 'warning' | 'error';

export interface StructuredNotice {
  code: string;
  message: string;
}

export interface StructuredError {
  code: CliErrorCode;
  message: string;
}

export interface StructuredOutput<T extends object = Record<string, unknown>> {
  status: StructuredStatus;
  message: string;
  data: T | null;
  errors: StructuredError[];
}

export function structuredSuccess<T extends object>(
  message: string,
  data: T,
  status: Exclude<StructuredStatus, 'error'> = 'success',
): StructuredOutput<T> {
  return { status, message, data, errors: [] };
}

export function isStructuredOutput(value: unknown): value is StructuredOutput {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const output = value as Record<string, unknown>;
  return (
    Object.keys(output).length === 4 &&
    ['success', 'warning', 'error'].includes(output.status as string) &&
    typeof output.message === 'string' &&
    (output.data === null || typeof output.data === 'object') &&
    Array.isArray(output.errors)
  );
}
