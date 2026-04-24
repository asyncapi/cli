import { AsyncAPIGenerator, GeneratorOptions } from '@asyncapi/generator';
import { promises as fs } from 'fs';
import { GeneratorError } from '../../errors/generator-error';

export class AsyncAPIGeneratorService {
  private generator: AsyncAPIGenerator;

  constructor() {
    this.generator = new AsyncAPIGenerator();
  }

  /**
   * Runs the AsyncAPI generator with the given document and options, ensuring
   * relative references are resolved correctly based on the input file's path.
   * @param inputFilePath The path to the main AsyncAPI document file.
   * @param templateName The name of the template to use.
   * @param options Additional generator options.
   * @returns A map of generated files, where keys are file paths and values are their content.
   */
  async runGenerator(
    inputFilePath: string,
    templateName: string,
    options: GeneratorOptions = {}
  ): Promise<Map<string, string | Buffer>> {
    try {
      const documentContent = await fs.readFile(inputFilePath, 'utf8');

      const resolvedOptions: GeneratorOptions = {
        ...options,
        // This is the crucial fix: set the base path for the parser.
        // The parser will use this path to resolve relative $ref values against the main document's location.
        parserOptions: {
          ...options.parserOptions,
          path: inputFilePath,
        },
      };

      return await this.generator.generate(documentContent, templateName, resolvedOptions);
    } catch (err: unknown) {
      throw new GeneratorError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
