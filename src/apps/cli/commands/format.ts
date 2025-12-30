 
import { promises as fPromises } from 'fs';
import { Args } from '@oclif/core';
import Command from '@cli/internal/base';

import {
  convertToJSON,
  convertToYaml,
  load,
  retrieveFileFormat,
} from '@models/SpecificationFile';
import { SpecificationWrongFileFormat } from '@errors/specification-file';
import { cyan, green } from 'picocolors';
import {
  convertFormatFlags,
  fileFormat,
} from '@cli/internal/flags/format.flags';

export default class Convert extends Command {
  static specFile: any;
  static metricsMetadata: any = {};
  static description =
    'Convert asyncapi documents from any format to yaml, yml or JSON';

  static flags = convertFormatFlags();

  static args = {
    'spec-file': Args.string({
      description: 'spec path, url, or context-name',
      required: false,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Convert);
    const filePath = args['spec-file'];
    const outputFileFormat = flags['format'] as fileFormat;
    let convertedFile;
    try {
      this.specFile = await load(filePath);
       
      this.metricsMetadata.to_version = flags['target-version'];

      const ff = retrieveFileFormat(this.specFile.text());
      const isSpecFileJson = ff === 'json';
      const isSpecFileYaml = ff === 'yaml';

      if (!isSpecFileJson && !isSpecFileYaml) {
        throw new SpecificationWrongFileFormat(filePath);
      }

      convertedFile = this.handleConversion(
        isSpecFileJson,
        isSpecFileYaml,
        outputFileFormat,
      );

      if (!convertedFile) {
        return;
      }
      await this.handleOutput(flags.output, convertedFile, outputFileFormat);
    } catch (err) {
      this.error(err as Error);
    }
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
      await fPromises.writeFile(finalFileName, formattedFile, {
        encoding: 'utf8',
      });
      this.log(
        `succesfully formatted to ${outputFileFormat} at ${green(finalFileName)} ✅`,
      );
    } else {
      this.log(formattedFile);
      this.log(`succesfully logged after formatting to ${outputFileFormat} ✅`);
    }
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
