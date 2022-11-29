import { Flags } from '@oclif/core';
import { Example } from '@oclif/core/lib/interfaces';
import Command from '../base';
import bundle from '@asyncapi/bundler';
import fs from 'fs';
import path from 'path';
import { ErrorLoadingSpec } from '../errors/specification-file';

export default class Bundle extends Command {
  static description = 'Bundle multiple asyncapi files together.';
  static strict = false;

  static examples: Example[] = [
    'asyncapi bundle ./asyncapi.yaml -o final.yaml',
    'asyncapi bundle ./asyncapi.yaml ./spec.yaml --reference-into-components'
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({ char: 'o', description: 'The output file name. Omitting this flag will create a main.yaml.' }),
    'reference-into-components': Flags.boolean({ char: 'r', description: 'Bundle the message $refs into components object.' }),
    base: Flags.string({ char: 'b', description: 'Path to the file which will act as a base. This is required when some properties are to needed to be overwritten.' }),
  };

  async run() {
    const { argv, flags } = await this.parse(Bundle);
    const output = flags.output;

    this.resolveFilePaths(argv, flags);

    const document = await bundle(
      argv.map((filePath) =>
        fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8')
      ),
      {
        referenceIntoComponents: flags['reference-into-components'],
        base: flags.base
          ? fs.readFileSync(
            path.resolve(process.cwd(), flags.base || ''),
            'utf-8'
          )
          : undefined,
      }
    );

    if (!output) {
      console.log(document.yml());
    } else {
      const format = path.extname(output);

      if (format === '.yml' || format === '.yaml') {
        fs.writeFileSync(path.resolve(process.cwd(), output), document.yml(), {
          encoding: 'utf-8',
        });
      }

      if (format === '.json') {
        fs.writeFileSync(path.resolve(process.cwd(), output), document.json(), {
          encoding: 'utf-8',
        });
      }
      this.log(`Check out your shiny new bundled files at ${output}`);
    }
  }

  private checkFilePath(filePath: string) {
    try {
      const stats = fs.statSync(path.resolve(process.cwd(), filePath));
      return fs.existsSync(filePath) && stats.isFile();
    } catch (error) {
      return false;
    }
  }

  private resolveFilePaths(arg: any, flags: any) {
    for (const file of arg) {
      if (!this.checkFilePath(file)) {
        throw new ErrorLoadingSpec('file', file);
      }
    }
    if (flags.base && !this.checkFilePath(flags.base)) {
      throw new ErrorLoadingSpec('file', flags.base);
    }
  }
}
