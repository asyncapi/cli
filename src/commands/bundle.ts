import { Flags } from '@oclif/core';
import { Example } from '@oclif/core/lib/interfaces';
import Command from '../base';
import bundle from '@asyncapi/bundler';
import { promises } from 'fs';
import path from 'path';
import { Specification, load } from '../models/SpecificationFile';
import { Parser } from '@asyncapi/parser';
import { Document } from '@asyncapi/bundler/lib/document';

const { writeFile } = promises;

export default class Bundle extends Command {
  static description = 'bundle one or multiple asyncapi documents and their references together.';
  static strict = false;

  static examples: Example[] = [
    'asyncapi bundle ./asyncapi.yaml > final-asyncapi.yaml',
    'asyncapi bundle ./asyncapi.yaml --output final-asyncapi.yaml',
    'asyncapi bundle ./asyncapi.yaml ./features.yaml --reference-into-components',
    'asyncapi bundle ./asyncapi.yaml ./features.yaml --base ./asyncapi.yaml --reference-into-components'
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({ char: 'o', description: 'The output file name. Omitting this flag the result will be printed in the console.' }),
    'reference-into-components': Flags.boolean({ char: 'r', description: 'Bundle the message $refs into components object.' }),
    base: Flags.string({ char: 'b', description: 'Path to the file which will act as a base. This is required when some properties are to needed to be overwritten.' }),
  };

  parser = new Parser();

  async run() {
    const { argv, flags } = await this.parse(Bundle);
    const output = flags.output;
    let baseFile;
    const outputFormat = path.extname(argv[0]);
    const AsyncAPIFiles = await this.loadFiles(argv);
    
    this.metricsMetadata.files = AsyncAPIFiles.length;

    if (flags.base) {baseFile = (await load(flags.base)).text();}

    const fileContents = AsyncAPIFiles.map((file) => file.text());

    const document = await bundle(fileContents,
      {
        referenceIntoComponents: flags['reference-into-components'],
        base: baseFile
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
      this.specFile = new Specification(document.string());
    } catch (e: any) {
      if (e instanceof Error) {
        this.log(`Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`);
      }
    }
  }

  async loadFiles(filepaths: string[]): Promise<Specification[]> {
    const files = [];
    for (const filepath of filepaths) {
      const file = await load(filepath);
      files.push(file);
    }
    return files;
  }
}
