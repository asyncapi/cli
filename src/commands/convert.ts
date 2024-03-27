/* eslint-disable @typescript-eslint/ban-ts-comment */
import { promises as fPromises } from 'fs';
import { Flags } from '@oclif/core';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';
import { SpecificationFileNotFound } from '../errors/specification-file';
import { convert } from '@asyncapi/converter';
import type { ConvertVersion } from '@asyncapi/converter';

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

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ];

  async run() {
    const { args, flags } = await this.parse(Convert);
    const filePath = args['spec-file'];
    let convertedFile;
    let convertedFileFormatted;

    try {
      // LOAD FILE
      this.specFile = await load(filePath);
      this.metricsMetadata.to_version = flags['target-version'];

      // CONVERSION
      convertedFile = convert(this.specFile.text(), flags['target-version'] as ConvertVersion);
      if (convertedFile) {
        if (this.specFile.getFilePath()) {
          this.log(`File ${this.specFile.getFilePath()} successfully converted!`);
        } else if (this.specFile.getFileURL()) {
          this.log(`URL ${this.specFile.getFileURL()} successfully converted!`);
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
      } else {
        this.error(err as Error);
      }
    }
  }
}
