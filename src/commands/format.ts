
import { Args } from '@oclif/core';
import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import Command from '../core/base';
import { load } from '../core/models/SpecificationFile';
import { ValidationError } from '../core/errors/validation-error';
import { formatFlags } from '../core/flags/format.flags';

export default class Format extends Command {
  static description = 'Format AsyncAPI specification file';

  static examples = [
    'asyncapi format ./asyncapi.yaml',
    'asyncapi format ./asyncapi.yaml --output formatted-asyncapi.yaml',
  ];

  static flags = formatFlags();

  static args = {
    'spec-file': Args.string({description: 'spec path, url, or context-name', required: true}),
  };

  async run() {
    const { args, flags } = await this.parse(Format);
    const filePath = args['spec-file'];
    const outputPath = flags.output; 

    try {
      this.specFile = await load(filePath);
    } catch (err) {
      this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: filePath,
        })
      );
    }
  
    const content = this.specFile.text();
    let formatted: string;
  
    try {
      const parsed = yaml.load(content);
      formatted = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: true,
      });
    } catch (err) {
      this.error(`Error formatting file: ${err}`);
    }
  
    if (outputPath) {
      await fs.writeFile(outputPath, formatted, 'utf8');
      this.log(`Formatted content has been written to ${outputPath}`);
    } else {
      await fs.writeFile(filePath, formatted, 'utf8');
      this.log(`File ${filePath} has been formatted in-place.`);
    }
  }
}
