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
  };

  static args = [
    { name: 'first-spec-file', description: 'first spec path or context-name', required: true },
    { name: 'second-spec-file', description: 'second spec path or context-name', required: true },
  ];

  async run() {
    const { args } = this.parse(Diff);
    const firstDocumentPath = args['first-spec-file'];
    const secondDocumentPath = args['second-spec-file'];

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
      this.log(JSON.stringify(diff.diff(firstDocumentParsed.json(), secondDocumentParsed.json())));
    } catch (error) {
      throw new ValidationError({
        type: 'parser-error',
        err: error,
      });
    }
  }
}
