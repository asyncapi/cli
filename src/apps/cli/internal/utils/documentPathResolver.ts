import { resolve, dirname } from 'path';
import { existsSync } from 'fs';

/**
 * Resolves the absolute path of the input document and returns its directory.
 * This directory should be used as the base directory for $ref resolution
 * when invoking the @asyncapi/generator.
 *
 * It takes the input file path (which can be relative to the current working directory),
 * resolves it to an absolute path, and then extracts the directory part.
 *
 * @param inputFilePath The path to the AsyncAPI document, as provided by the user via a CLI flag (e.g., -i).
 * @returns The absolute path to the directory containing the input document.
 * @throws Error if the input file does not exist at the resolved path.
 */
export function getDocumentBaseDir(inputFilePath: string): string {
  // Resolve the input path relative to the current working directory to get an absolute path.
  const absoluteInputPath = resolve(process.cwd(), inputFilePath);

  // Verify that the file exists to provide a clearer error message if it doesn't.
  if (!existsSync(absoluteInputPath)) {
    throw new Error(`Input AsyncAPI document not found at: ${absoluteInputPath}`);
  }

  // Return the directory name of the absolute input path.
  return dirname(absoluteInputPath);
}

