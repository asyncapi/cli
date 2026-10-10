import path from 'path';

const ALLOWED_SPEC_EXTENSIONS = ['yml', 'yaml', 'json'] as const;

/**
 * Returns the file extension for a specification file name.
 */
export function getSpecFileExtension(fileName: string): string {
  return path.extname(fileName).slice(1).toLowerCase();
}

/**
 * Checks whether the extension is supported for AsyncAPI specification files.
 */
export function isAllowedSpecExtension(extension: string): boolean {
  return (ALLOWED_SPEC_EXTENSIONS as readonly string[]).includes(extension);
}
