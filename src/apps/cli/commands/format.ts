import { existsSync, promises as fPromises } from 'fs';
import path from 'path';
import { Args } from '@oclif/core';
import Command from '@cli/internal/base';

import {
  convertToJSON,
  convertToYaml,
  load,
  retrieveFileFormat,
  Specification,
} from '@models/SpecificationFile';
import { SpecificationWrongFileFormat } from '@errors/specification-file';
import { cyan, green } from 'picocolors';
import {
  convertFormatFlags,
  fileFormat,
} from '@cli/internal/flags/format.flags';

export default class Format extends Command {
  static description =
    'Convert asyncapi documents from any format to yaml, yml or JSON';

  static flags = convertFormatFlags();

  static args = {
    'spec-file': Args.string({
      description: 'spec path, url, or context-name',
      required: false,
    }),
  };

  async run(): Promise<unknown> {
    const { args, flags } = await this.parse(Format);
    const filePath = args['spec-file'];
    const outputFileFormat = flags['format'] as fileFormat;
    this.specFile = await load(filePath);
    this.metricsMetadata.output_format = outputFileFormat;

    const ff = retrieveFileFormat(this.specFile.text());
    const isSpecFileJson = ff === 'json';
    const isSpecFileYaml = ff === 'yaml';

    if (!isSpecFileJson && !isSpecFileYaml) {
      throw new SpecificationWrongFileFormat(filePath);
    }

    const convertedFile = this.handleConversion(
      isSpecFileJson,
      isSpecFileYaml,
      outputFileFormat,
    );

    if (!convertedFile) {
      return;
    }
    const output = await this.handleOutput(flags.output, convertedFile, outputFileFormat);
    return this.result('The AsyncAPI document was formatted successfully.', {
      source: sourceData(filePath, this.specFile),
      sourceFormat: ff,
      targetFormat: outputFileFormat,
      document: output ? null : new Specification(convertedFile).toJson(),
      output,
      warnings: [],
    });
  }

  private handleConversion(
    isSpecFileJson: boolean,
    isSpecFileYaml: boolean,
    outputFileFormat: fileFormat,
  ): string | undefined {
    const text = this.specFile?.text();
    if (isSpecFileJson && text) {
      if (outputFileFormat === 'json') {
        throw new Error(`Your document is already a ${cyan('JSON')}`);
      }
      return convertToYaml(text);
    }
    if (isSpecFileYaml && text) {
      if (outputFileFormat === 'yaml' || outputFileFormat === 'yml') {
        throw new Error(`Your document is already a ${cyan('YAML')}`);
      }
      return convertToJSON(text);
    }
  }

  private async handleOutput(
    outputPath: string | undefined,
    formattedFile: string,
    outputFileFormat: fileFormat,
  ) {
    if (outputPath) {
      outputPath = this.removeExtensionFromOutputPath(outputPath);
      const finalFileName = `${outputPath}.${outputFileFormat}`;
      const resolvedPath = path.resolve(finalFileName);
      const overwritten = existsSync(resolvedPath);
      await fPromises.writeFile(finalFileName, formattedFile, {
        encoding: 'utf8',
      });
      this.log(
        `succesfully formatted to ${outputFileFormat} at ${green(finalFileName)} ✅`,
      );
      return { path: resolvedPath, format: outputFileFormat, overwritten };
    }
    this.log(formattedFile);
    this.log(`succesfully logged after formatting to ${outputFileFormat} ✅`);
    return null;
  }

  private removeExtensionFromOutputPath(filename: string): string {
    // Removes the extension from a filename if it is .json, .yaml, or .yml
    // this is so that we can remove the provided extension name in the -o flag and
    // apply our own extension name according to the content of the file
    const validExtensions = ['json', 'yaml', 'yml'];

    const parts = filename.split('.');

    if (parts.length > 1) {
      const extension = parts.pop()?.toLowerCase();
      if (extension && validExtensions.includes(extension)) {
        return parts.join('.');
      }
    }

    return filename;
  }
}

function sourceData(input: string | undefined, specification: Specification) {
  const source = specification.getFileURL() ?? specification.getFilePath() ?? input ?? '';
  const resolved = specification.getFileURL() ?? path.resolve(source);
  let kind = 'context';
  if (specification.getFileURL()) {
    kind = 'url';
  } else if (!input) {
    kind = 'auto-detected';
  } else if (path.resolve(input) === resolved) {
    kind = 'file';
  }
  return { input: input ?? source, kind, resolved };
}
