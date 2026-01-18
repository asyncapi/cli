/**
 * Input validation utilities for CLI commands and API endpoints.
 * Provides reusable validation functions with consistent error messages.
 */

/**
 * Validates that a file path is provided and not empty.
 *
 * @param filePath - The file path to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result with error message if invalid
 */
export function validateFilePath(
  filePath: string | undefined,
  fieldName = 'file path'
): { valid: true; value: string } | { valid: false; error: string } {
  if (!filePath || filePath.trim() === '') {
    return {
      valid: false,
      error: `${fieldName} is required and cannot be empty`,
    };
  }
  return { valid: true, value: filePath.trim() };
}

/**
 * Validates that a value is one of the allowed options.
 *
 * @param value - The value to validate
 * @param allowedValues - Array of allowed values
 * @param fieldName - Name of the field for error messages
 * @returns Validation result
 */
export function validateEnum<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[],
  fieldName = 'value'
): { valid: true; value: T } | { valid: false; error: string } {
  if (!value) {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }
  if (!allowedValues.includes(value as T)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    };
  }
  return { valid: true, value: value as T };
}

/**
 * Validates that a port number is valid.
 *
 * @param port - The port to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result
 */
export function validatePort(
  port: string | number | undefined,
  fieldName = 'port'
): { valid: true; value: number } | { valid: false; error: string } {
  if (port === undefined || port === '') {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return {
      valid: false,
      error: `${fieldName} must be a valid port number (1-65535)`,
    };
  }

  return { valid: true, value: portNum };
}

/**
 * Validates a URL string.
 *
 * @param url - The URL to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result
 */
export function validateUrl(
  url: string | undefined,
  fieldName = 'URL'
): { valid: true; value: string } | { valid: false; error: string } {
  if (!url || url.trim() === '') {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  try {
    new URL(url);
    return { valid: true, value: url };
  } catch {
    return {
      valid: false,
      error: `${fieldName} is not a valid URL`,
    };
  }
}

/**
 * Validates that a value is a non-empty string.
 *
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result
 */
export function validateNonEmptyString(
  value: string | undefined,
  fieldName = 'value'
): { valid: true; value: string } | { valid: false; error: string } {
  if (!value || value.trim() === '') {
    return {
      valid: false,
      error: `${fieldName} is required and cannot be empty`,
    };
  }
  return { valid: true, value: value.trim() };
}

/**
 * Validates that a version string matches semantic versioning pattern.
 *
 * @param version - The version string to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result
 */
export function validateVersion(
  version: string | undefined,
  fieldName = 'version'
): { valid: true; value: string } | { valid: false; error: string } {
  if (!version) {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  // Matches patterns like 1.0.0, 2.0.0, 3.0.0, etc.
  const semverPattern = /^\d+\.\d+\.\d+$/;
  if (!semverPattern.test(version)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid semantic version (e.g., 3.0.0)`,
    };
  }

  return { valid: true, value: version };
}

/**
 * Type guard to check if a value is defined (not null or undefined).
 *
 * @param value - Value to check
 * @returns True if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a non-empty array.
 *
 * @param value - Value to check
 * @returns True if value is a non-empty array
 */
export function isNonEmptyArray<T>(value: T[] | null | undefined): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

