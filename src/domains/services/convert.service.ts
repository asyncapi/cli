import {
  ConversionOptions,
  ConversionResult,
  ServiceResult,
} from '@/interfaces';
import { Specification } from '@models/SpecificationFile';
import { BaseService } from './base.service';
import {
  convert,
  convertOpenAPI,
  convertPostman,
  OpenAPIConvertVersion,
} from '@asyncapi/converter';
import { cyan, green } from 'picocolors';
import { promises as fPromises } from 'node:fs';

export class ConversionService extends BaseService {
  /**
   * Handles the conversion of AsyncAPI, Postman or OpenAPI documents based on the provided flags.
   */
  async convertDocument(
    specFile: Specification,
    options: ConversionOptions,
  ): Promise<ServiceResult<ConversionResult>> {
    let convertedDocument: string;
    switch (options.format) {
    case 'asyncapi':
      convertedDocument = convert(
        specFile.text() ?? '',
        options['target-version'] || '3.0.0',
      );
      break;
    case 'openapi':
      convertedDocument = convertOpenAPI(
        specFile.text() ?? '',
          specFile.toJson().openapi as OpenAPIConvertVersion,
          {
            perspective: options.perspective,
          },
      );
      break;
    case 'postman-collection':
      convertedDocument = convertPostman(specFile.text() ?? '', '3.0.0', {
        perspective: options.perspective,
      });
      break;
    default:
      return this.createErrorResult(
        `Unsupported conversion format: ${options.format}`,
      );
    }

    return this.createSuccessResult<ConversionResult>({
      convertedDocument: this.formatConvertedFile(convertedDocument),
      originalFormat: options.format,
    });
  }

  handleLogging(specFile: Specification, flags: ConversionOptions): string {
    const sourcePath = specFile.getFilePath() || specFile.getFileURL();
    const targetVersion = flags['target-version'] || 'latest';
    const outputMap = {
      asyncapi: 'AsyncAPI document',
      openapi: 'OpenAPI document',
      'postman-collection': 'Postman Collection',
    };

    return `🎉 The ${outputMap[flags.format]} from ${cyan(sourcePath)} has been successfully converted to AsyncAPI version ${green(targetVersion)}!!`;
  }

  /**
   * Formats the converted document for output.
   * Objects are stringified with indentation, strings are returned as-is.
   *
   * @param convertedFile - The converted file content
   * @returns Formatted string representation
   */
  private formatConvertedFile(convertedFile: string | object): string {
    return typeof convertedFile === 'object'
      ? JSON.stringify(convertedFile, null, 4)
      : convertedFile;
  }

  /**
   * Writes the converted document to the specified output path.
   *
   * @param outputPath - The path to write the file to
   * @param convertedFileFormatted - The formatted content to write
   */
  async handleOutput(outputPath: string, convertedFileFormatted: string): Promise<void> {
    await fPromises.writeFile(outputPath, convertedFileFormatted, {
      encoding: 'utf8',
    });
  }
}
