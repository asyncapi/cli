import {flags} from '@oclif/command';
import * as cupid from '@asyncapi/cupid';
import Command from '../base';
import { load } from '../models/SpecificationFile';
import { ValidationError } from '../errors/validation-error';
import { SpecificationFileNotFound } from '../errors/specification-file';

export default class Relation extends Command {
  static description = 'visualize your defined event-driven architecture'

  static flags = {
    help: flags.help({char: 'h'}),
    type: flags.string({
      char: 't', 
      description: 'the type of output syntax, currently supporting mermaid, plantUML and reactFlow'
    }),
  }
  
  static strict = false;

  static args = [
    { name: 'spec-file', description: 'spec path or context-name', required: true },
  ];

  async loadFiles(files: string[]) {
    const docs: string[] = [];

    await Promise.all(files.map(async (file) => {
      try {
        const spec = await load(file);
        docs.push(await spec.read());
      } catch (err) {
        if (err instanceof SpecificationFileNotFound) {
          this.error(
            new ValidationError({
              type: 'invalid-file',
              filepath: file,
            })
          );
        } else {
          this.error(err as Error);
        }
      }
    }));
    return docs;
  }

  async run() {
    const { argv, flags } = this.parse(Relation);

    const outputType = flags['type'];

    let docs;

    if (argv.length <= 1) {
      throw this.error('Please provide more than one context/filepaths.');
    }

    try {
      docs = await this.loadFiles(argv);
    } catch (err) {
      this.error(err as Error);
    }

    let result;
    try {
      if (outputType) {
        result = await cupid.getRelations(docs,{syntax: outputType});
      } else {
        result = await cupid.getRelations(docs);
      }
      this.log(result);
    } catch (err) {
      this.error(err as Error);
    }
  }
}
