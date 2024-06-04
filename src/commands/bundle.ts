import { Flags } from '@oclif/core';
import Command from '../core/base';
import bundle from '@asyncapi/bundler';
import { promises } from 'fs';
import path from 'path';
import { Specification } from '../core/models/SpecificationFile';
import { Document } from '@asyncapi/bundler/lib/document';

const { writeFile } = promises;

export default class Bundle extends Command {
  static readonly description = 'Bundle one or multiple AsyncAPI Documents and their references together.';
  static strict = false;

  static examples = [
    'asyncapi bundle ./asyncapi.yaml > final-asyncapi.yaml',
    'asyncapi bundle ./asyncapi.yaml --output final-asyncapi.yaml',
    'asyncapi bundle ./asyncapi.yaml ./features.yaml',
    'asyncapi bundle ./asyncapi.yaml ./features.yaml --base ./main.yaml',
    'asyncapi bundle ./asyncapi.yaml ./features.yaml --base ./main.yaml --xOrigin',
    'asyncapi bundle ./asyncapi.yaml -o final-asyncapi.yaml --base ../public-api/main.yaml --baseDir ./social-media/comments-service',
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({ char: 'o', description: 'The output file name. Omitting this flag the result will be printed in the console.' }),
    base: Flags.string({ char: 'b', description: 'Path to the file which will act as a base. This is required when some properties need to be overwritten.' }),
    baseDir: Flags.string({ char: 'd', description: 'One relative/absolute path to directory relative to which paths to AsyncAPI Documents that should be bundled will be resolved.' }),
    xOrigin: Flags.boolean({ char: 'x', description: 'Pass this switch to generate properties "x-origin" that will contain historical values of dereferenced "$ref"s.' }),
  };

  async run() {
    const { argv, flags } = await this.parse(Bundle);
    const output = flags.output;
    const outputFormat = path.extname(argv[0] as string);
    const AsyncAPIFiles = argv as string[];

    this.metricsMetadata.files = AsyncAPIFiles.length;

    const document = await bundle(AsyncAPIFiles,
      {
        base: flags.base,
        baseDir: flags.baseDir,
        xOrigin: flags.xOrigin,
      }
    );

    await this.collectMetricsData(document);

    if (!output) {
      if (outputFormat === '.yaml' || outputFormat === '.yml') {
        this.log(document.yml());
      } else {
        this.log(JSON.stringify(document.json()));
      }
    } else {
      const format = path.extname(output);

      if (format === '.yml' || format === '.yaml') {
        await writeFile(path.resolve(process.cwd(), output), document.yml(), {
          encoding: 'utf-8',
        });
      }

      if (format === '.json') {
        await writeFile(path.resolve(process.cwd(), output), document.string(), {
          encoding: 'utf-8',
        });
      }
      this.log(`Check out your shiny new bundled files at ${output}`);
    }
  }

  private async collectMetricsData(document: Document) {
    try {
      // We collect the metadata from the final output so it contains all the files
      this.specFile = new Specification(document.string() ?? '');
    } catch (e: any) {
      if (e instanceof Error) {
        this.log(`Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`);
      }
    }
  }
}
