import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

/**
 * Parses a `--port` flag value. An omitted value becomes `0` (an OS-assigned port).
 * Throws CLI_INTEGER_INVALID for anything that is not an integer in 0-65535.
 */
export function parsePortFlag(value: string | undefined): number {
  if (value === undefined || value === '') {
    return 0;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new ApplicationError(
      CLI_ERROR_CODES.CLI_INTEGER_INVALID,
      `Invalid --port value "${value}". Expected an integer between 0 and 65535.`,
      { details: { port: value } },
    );
  }
  return port;
}
