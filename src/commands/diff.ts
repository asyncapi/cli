/* eslint-disable sonarjs/no-duplicate-string */
import { Flags } from '@oclif/core';
import * as diff from '@asyncapi/diff';
import AsyncAPIDiff from '@asyncapi/diff/lib/asyncapidiff';
import * as parser from '@asyncapi/parser';
import { promises as fs } from 'fs';
import { load, Specification } from '../models/SpecificationFile';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { SpecificationFileNotFound } from '../errors/specification-file';
import {
  DiffOverrideFileError,
  DiffOverrideJSONError,
} from '../errors/diff-error';
import { specWatcher, specWatcherParams } from '../globals';
import { watchFlag } from '../flags';

const { readFile } = fs;

export default class Diff extends Command {
  static description = 'find diff between two asyncapi files';

  static flags = {
    help: Flags.help({ char: 'h' }),
    format: Flags.string({
      char: 'f',
      description: 'format of the output',
      default: 'json',
      options: ['json'],
    }),
    type: Flags.string({
      char: 't',
      description: 'type of the output',
      default: 'all',
      options: ['breaking', 'non-breaking', 'unclassified', 'all'],
    }),
    overrides: Flags.string({
      char: 'o',
      description: 'path to JSON file containing the override properties',
    }),
    watch: watchFlag
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
    const { args, flags } = await this.parse(Diff); // NOSONAR
    const firstDocumentPath = args['old'];
    const secondDocumentPath = args['new'];

    const outputFormat = flags['format'];
    const outputType = flags['type'];
    const overrideFilePath = flags['overrides'];
    const watchMode = flags['watch'];
    let firstDocument: Specification, secondDocument: Specification;

    try {
      firstDocument = await load(firstDocumentPath);
      enableWatch(watchMode, { spec: firstDocument, handler: this, handlerName: 'diff', docVersion: 'old', label: 'DIFF_OLD' });
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
      enableWatch(watchMode, { spec: secondDocument, handler: this, handlerName: 'diff', docVersion: 'new', label: 'DIFF_NEW' });
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

    let overrides = {};
    if (overrideFilePath) {
      try {
        overrides = await readOverrideFile(overrideFilePath);
      } catch (err) {
        this.error(err as Error);
      }
    }

    try {
      const firstDocumentParsed = await parser.parse(firstDocument.text());
      const secondDocumentParsed = await parser.parse(secondDocument.text());
      const diffOutput = diff.diff(
        firstDocumentParsed.json(),
        secondDocumentParsed.json(),
        {
          override: overrides,
        }
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

/**
 * Reads the file from give path and parses it as JSON
 * @param path The path to override file
 * @returns The override object
 */
async function readOverrideFile(path: string): Promise<diff.OverrideObject> {
  let overrideStringData;
  try {
    overrideStringData = await readFile(path, { encoding: 'utf8' });
  } catch (err) {
    throw new DiffOverrideFileError();
  }

  try {
    return JSON.parse(overrideStringData);
  } catch (err) {
    throw new DiffOverrideJSONError();
  }
}
/**
 * function to enable watchmode.
 * The function is abstracted here, to avoid eslint cognitive complexity error.
 */
const enableWatch = (status: boolean, watcher: specWatcherParams) => {
  if (status) {
    specWatcher(watcher);
  }
};

