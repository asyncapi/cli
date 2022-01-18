import { flags } from '@oclif/command';
import * as diff from '@asyncapi/diff';
import * as parser from '@asyncapi/parser';
import { load, Specification } from '../models/SpecificationFile';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { SpecificationFileNotFound } from '../errors/specification-file';
import AsyncAPIDiff from '@asyncapi/diff/lib/asyncapidiff';

export default class Diff extends Command {
  static description = 'find diff between two asyncapi files';

  static flags = {
    help: flags.help({ char: 'h' }),
    format: flags.string({
      char: 'f',
      description: 'format of the output',
      default: 'json',
      options: ['json'],
    }),
    type: flags.string({
      char: 't',
      description: 'type of the output',
      default: 'all',
      options: ['breaking', 'non-breaking', 'unclassified', 'all'],
    }),
  };

  static args = [
    {
      name: 'old',
      description: 'old spec path, URL or context-name',
      required: true,
    },
    {
      name: 'new',
      description: 'new spec path, URL or context-name',
      required: true,
    },
  ];

  async run() {
    const { args, flags } = this.parse(Diff);
    const firstDocumentPath = args['old'];
    const secondDocumentPath = args['new'];

    const outputFormat = flags['format'];
    const outputType = flags['type'];

    let firstDocument: Specification, secondDocument: Specification;

    try {
      firstDocument = await load(firstDocumentPath);
    } catch (err) {
      if (err instanceof SpecificationFileNotFound) {
        this.error(
          new ValidationError({
            type: 'invalid-file',
            filepath: firstDocumentPath,
          })
        );
      } else {
        this.error(err as Error);
      }
    }

    try {
      secondDocument = await load(secondDocumentPath);
    } catch (err) {
      if (err instanceof SpecificationFileNotFound) {
        this.error(
          new ValidationError({
            type: 'invalid-file',
            filepath: secondDocumentPath,
          })
        );
      } else {
        this.error(err as Error);
      }
    }

    try {
      const firstDocumentParsed = await parser.parse(firstDocument.text());
      const secondDocumentParsed = await parser.parse(secondDocument.text());
      const diffOutput = diff.diff(
        firstDocumentParsed.json(),
        secondDocumentParsed.json()
      );

      if (outputFormat === 'json') {
        this.outputJson(diffOutput, outputType);
      } else {
        this.log(
          `The output format ${outputFormat} is not supported at the moment.`
        );
      }
    } catch (error) {
      throw new ValidationError({
        type: 'parser-error',
        err: error,
      });
    }
  }

  outputJson(diffOutput: AsyncAPIDiff, outputType: string) {
    if (outputType === 'breaking') {
      this.log(JSON.stringify(diffOutput.breaking(), null, 2));
    } else if (outputType === 'non-breaking') {
      this.log(JSON.stringify(diffOutput.nonBreaking(), null, 2));
    } else if (outputType === 'unclassified') {
      this.log(JSON.stringify(diffOutput.unclassified(), null, 2));
    } else if (outputType === 'all') {
      this.log(JSON.stringify(diffOutput.getOutput(), null, 2));
    } else {
      this.log(`The output type ${outputType} is not supported at the moment.`);
    }
  }
}
