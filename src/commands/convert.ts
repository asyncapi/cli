/* eslint-disable @typescript-eslint/ban-ts-comment */
import { promises as fPromises } from 'fs';
import { Flags, Args } from '@oclif/core';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';
import { SpecificationFileNotFound } from '../errors/specification-file';
import { convert } from '@asyncapi/converter';
import type { ConvertVersion } from '@asyncapi/converter';
import { cyan, green } from 'picocolors';

// @ts-ignore
import specs from '@asyncapi/specs';

const latestVersion = Object.keys(specs.schemas).pop() as string;

export default class Convert extends Command {
  static description = 'Convert asyncapi documents older to newer versions';

  static flags = {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({ char: 'o', description: 'path to the file where the result is saved' }),
    'target-version': Flags.string({ char: 't', description: 'asyncapi version to convert to', default: latestVersion })
  };

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

      // CONVERSION
      convertedFile = convert(this.specFile.text(), flags['target-version'] as ConvertVersion);
      if (convertedFile) {
        if (this.specFile.getFilePath()) {
          this.log(`🎉 The ${cyan(this.specFile.getFilePath())} file has been successfully converted to version ${green(flags['target-version'])}!!`);
        } else if (this.specFile.getFileURL()) {
          this.log(`🎉 The URL ${cyan(this.specFile.getFileURL())} has been successfully converted to version ${green(flags['target-version'])}!!`);
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
