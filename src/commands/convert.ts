/* eslint-disable @typescript-eslint/ban-ts-comment */
import { promises as fPromises } from 'fs';
import { Args } from '@oclif/core';
import Command from '../core/base';
import { ValidationError } from '../core/errors/validation-error';
import { load } from '../core/models/SpecificationFile';
import { SpecificationFileNotFound } from '../core/errors/specification-file';
import { convert, convertOpenAPI } from '@asyncapi/converter';
import type { AsyncAPIConvertVersion, OpenAPIConvertVersion } from '@asyncapi/converter';
import { cyan, green } from 'picocolors';

// @ts-ignore
import specs from '@asyncapi/specs';
import { convertFlags } from '../core/flags/convert.flags';

const latestVersion = Object.keys(specs.schemas).pop() as string;

export default class Convert extends Command {
  static description = 'Convert asyncapi documents older to newer versions or OpenAPI documents to AsyncAPI';

  static flags = convertFlags(latestVersion);

  static args = {
    'spec-file': Args.string({description: 'spec path, url, or context-name', required: false}),
  };

  async run() {
    const { args, flags } = await this.parse(Convert);
    const filePath = args['spec-file'];
    let convertedFile;
    let convertedFileFormatted;

    try {
      // LOAD FILE
      this.specFile = await load(filePath);
      // eslint-disable-next-line sonarjs/no-duplicate-string
      this.metricsMetadata.to_version = flags['target-version'];

      // Determine if the input is OpenAPI or AsyncAPI
      const specJson = this.specFile.toJson();
      const isOpenAPI = 'openapi' in specJson;

      // CONVERSION
      if (isOpenAPI) {
        convertedFile = convertOpenAPI(this.specFile.text(), specJson.openapi as OpenAPIConvertVersion, {
          perspective: flags['perspective'] as 'client' | 'server'
        });
        this.log(`🎉 The OpenAPI document has been successfully converted to AsyncAPI version ${green(flags['target-version'])}!`);
      } else {
        convertedFile = convert(this.specFile.text(), flags['target-version'] as AsyncAPIConvertVersion);
        if (this.specFile.getFilePath()) {
          this.log(`🎉 The ${cyan(this.specFile.getFilePath())} file has been successfully converted to version ${green(flags['target-version'])}!`);
        } else if (this.specFile.getFileURL()) {
          this.log(`🎉 The URL ${cyan(this.specFile.getFileURL())} has been successfully converted to version ${green(flags['target-version'])}!`);
        }
      }

      if (typeof convertedFile === 'object') {
        convertedFileFormatted = JSON.stringify(convertedFile, null, 4);
      } else {
        convertedFileFormatted = convertedFile;
      }

      if (flags.output) {
        await fPromises.writeFile(`${flags.output}`, convertedFileFormatted, { encoding: 'utf8' });
      } else {
        this.log(convertedFileFormatted);
      }
    } catch (err) {
      if (err instanceof SpecificationFileNotFound) {
        this.error(new ValidationError({
          type: 'invalid-file',
          filepath: filePath
        }));
      } else if (this.specFile?.toJson().asyncapi > flags['target-version']) {
        this.error(`The ${cyan(filePath)} file cannot be converted to an older version. Downgrading is not supported.`);
      } else {
        this.error(err as Error);
      }
    }
  }
}
