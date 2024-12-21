import { Args } from '@oclif/core';
import { promises as fs } from 'fs';
import * as yaml from 'yaml';
import Command from '../core/base';
import { load , retrieveFileFormat} from '../core/models/SpecificationFile';
import { ValidationError } from '../core/errors/validation-error';
import { prettyFlags } from '../core/flags/pretty.flags';

export default class Pretty extends Command {
  static readonly description = 'Format AsyncAPI specification file';

  static readonly examples = [
    'asyncapi pretty ./asyncapi.yaml',
    'asyncapi pretty ./asyncapi.yaml --output formatted-asyncapi.yaml',
  ];

  static readonly flags = prettyFlags();

  static readonly args = {
    'spec-file': Args.string({description: 'spec path, url, or context-name', required: true}),
  };

  async run() {
    const { args, flags } = await this.parse(Pretty);
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
      const fileFormat = retrieveFileFormat(this.specFile.text());
      if (fileFormat === 'yaml' || fileFormat === 'yml') {
        const yamlDoc = yaml.parseDocument(content);
        formatted = yamlDoc.toString({
          lineWidth: 0, 
        });
      } else if (fileFormat === 'json') {
        const jsonObj = JSON.parse(content); 
        formatted = JSON.stringify(jsonObj, null, 2); 
      } else {
        throw new Error('Unsupported file format');
      }
    } catch (err) {
      this.error(`Error formatting file: ${err}`);
    }

    if (outputPath) {
      await fs.writeFile(outputPath, formatted, 'utf8');
      this.log(`Asyncapi document has been beautified ${outputPath}`);
    } else {
      await fs.writeFile(filePath, formatted, 'utf8');
      this.log(`Asyncapi document ${filePath} has been beautified in-place.`);
    }
  }
}
