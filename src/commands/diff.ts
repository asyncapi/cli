import { flags } from '@oclif/command';
import * as diff from '@asyncapi/diff';
import * as parser from '@asyncapi/parser';
import { load } from '../models/SpecificationFile';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { SpecificationFileNotFound } from '../errors/specification-file';

export default class Diff extends Command {
  static description = 'find diff between two asyncapi files';

  static flags = {
    help: flags.help({ char: 'h' }),
    format: flags.string({ char: 'o', description: 'output format', default: 'json' }),
    breaking: flags.boolean({ description: 'get the breaking changes' }),
    'non-breaking': flags.boolean({ description: 'get the non-breaking changes' }),
    unclassified: flags.boolean({ description: 'get the unclassified changes' })
  };

  static args = [
    { name: 'first-spec-file', description: 'first spec path or context-name', required: true },
    { name: 'second-spec-file', description: 'second spec path or context-name', required: true },
  ];

  async run() {
    const { args, flags } = this.parse(Diff);
    const firstDocumentPath = args['first-spec-file'];
    const secondDocumentPath = args['second-spec-file'];

    const outputFormat = flags['format'];

    const showBreakingChanges = flags['breaking'];
    const showNonBreakingChanges = flags['non-breaking'];
    const showUnclassifiedChanges = flags['unclassified'];

    let firstDocument, secondDocument;

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
      const firstDocumentParsed = await parser.parse(
        await firstDocument.read()
      );
      const secondDocumentParsed = await parser.parse(
        await secondDocument.read()
      );
      const diffOutput = diff.diff(firstDocumentParsed.json(), secondDocumentParsed.json());

      if (outputFormat === 'json') {
        if (showBreakingChanges) {
          this.log(JSON.stringify(diffOutput.breaking()));
        } else if (showNonBreakingChanges) {
          this.log(JSON.stringify(diffOutput.nonBreaking()));
        } else if (showUnclassifiedChanges) {
          this.log(JSON.stringify(diffOutput.unclassified()));
        } else {
          this.log(JSON.stringify(diffOutput.getOutput()));
        }
      }
    } catch (error) {
      throw new ValidationError({
        type: 'parser-error',
        err: error,
      });
    }
  }
}
