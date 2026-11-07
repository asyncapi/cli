import { Args } from '@oclif/core';
import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';
import * as yaml from 'yaml';
import Command from '@cli/internal/base';
import { load, retrieveFileFormat } from '@models/SpecificationFile';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';
import { prettyFlags } from '@cli/internal/flags/pretty.flags';

export default class Pretty extends Command {
  static readonly description =
    'Beautify the AsyncAPI spec file (indentation, styling) in place or output the formatted spec to a new file.';

  static readonly examples = [
    'asyncapi pretty ./asyncapi.yaml',
    'asyncapi pretty ./asyncapi.yaml --output formatted-asyncapi.yaml',
  ];

  static readonly flags = prettyFlags();

  static readonly args = {
    'spec-file': Args.string({
      description: 'spec path, url, or context-name',
      required: true,
    }),
  };

  async run(): Promise<unknown> {
    const { args, flags } = await this.parse(Pretty);
    const filePath = args['spec-file'];
    const outputPath = flags.output;

    // load() throws typed errors that the central error mapper classifies.
    this.specFile = await load(filePath);

    const content = this.specFile.text();
    let formatted: string;

    let fileFormat: 'json' | 'yaml';
    let unsupportedFormat = false;
    try {
      const detectedFormat = retrieveFileFormat(this.specFile.text());
      if (detectedFormat === 'yaml' || detectedFormat === 'yml') {
        fileFormat = 'yaml';
        const yamlDoc = yaml.parseDocument(content);
        formatted = yamlDoc.toString({
          lineWidth: 0,
        });
      } else if (detectedFormat === 'json') {
        fileFormat = 'json';
        const jsonObj = JSON.parse(content);
        formatted = JSON.stringify(jsonObj, null, 2);
      } else {
        unsupportedFormat = true;
        throw new Error('Unsupported file format');
      }
    } catch (err) {
      const code = unsupportedFormat
        ? CLI_ERROR_CODES.DOCUMENT_FORMAT_UNSUPPORTED
        : CLI_ERROR_CODES.FILE_WRITE_FAILED;
      // Preserve the historical `Error:` prefix of oclif's string errors.
      throw Object.assign(
        new ApplicationError(code, `Error formatting file: ${err}`, { cause: err }),
        { name: 'Error' },
      );
    }

    const writtenPath = path.resolve(outputPath ?? filePath);
    const overwritten = existsSync(writtenPath);
    if (outputPath) {
      await fs.writeFile(outputPath, formatted, 'utf8');
      this.log(`Asyncapi document has been beautified ${outputPath}`);
    } else {
      await fs.writeFile(filePath, formatted, 'utf8');
      this.log(`Asyncapi document ${filePath} has been beautified in-place.`);
    }

    return this.result('The AsyncAPI document was beautified successfully.', {
      source: {
        input: filePath,
        kind: this.specFile.getFileURL() ? 'url' : 'file',
        resolved: this.specFile.getFileURL() ?? path.resolve(this.specFile.getFilePath() ?? filePath),
      },
      format: fileFormat,
      output: { path: writtenPath, format: fileFormat, overwritten },
      warnings: [],
    });
  }
}
