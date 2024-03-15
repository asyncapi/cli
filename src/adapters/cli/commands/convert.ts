/* eslint-disable @typescript-eslint/ban-ts-comment */
import { promises as fPromises } from 'fs';
import Command from '../core/base';
import { ValidationError } from '../../../errors/validation-error';
import { load } from '../core/models/SpecificationFile';
import { SpecificationFileNotFound } from '../../../errors/specification-file';
import { convert } from '@asyncapi/converter';

import type { ConvertVersion } from '@asyncapi/converter';

// @ts-ignore
import specs from '@asyncapi/specs';
import { convertFlags } from '../core/flags/convert.flags';

const latestVersion = Object.keys(specs.schemas).pop() as string;

export default class Convert extends Command {
  static description = 'Convert asyncapi documents older to newer versions';

  static flags = convertFlags(latestVersion);

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ];

  async run() {
    const { args, flags } = await this.parse(Convert);
    const filePath = args['spec-file'];
    let specFile;
    let convertedFile;
    let convertedFileFormatted;

    try {
      // LOAD FILE
      specFile = await load(filePath);

      // CONVERSION
      convertedFile = convert(specFile.text(), flags['target-version'] as ConvertVersion);
      if (convertedFile) {
        if (specFile.getFilePath()) {
          this.log(`File ${specFile.getFilePath()} successfully converted!`);
        } else if (specFile.getFileURL()) {
          this.log(`URL ${specFile.getFileURL()} successfully converted!`);
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
