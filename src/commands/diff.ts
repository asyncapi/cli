/* eslint-disable sonarjs/no-duplicate-string */
import { Flags } from '@oclif/core';
import * as diff from '@asyncapi/diff';
import AsyncAPIDiff from '@asyncapi/diff/lib/asyncapidiff';
import { promises as fs } from 'fs';
import { load, Specification } from '../models/SpecificationFile';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { SpecificationFileNotFound } from '../errors/specification-file';
import {
  DiffBreakingChangeError,
  DiffOverrideFileError,
  DiffOverrideJSONError,
} from '../errors/diff-error';
import { specWatcher } from '../globals';
import { watchFlag } from '../flags';
import { validationFlags, parse, convertToOldAPI } from '../parser';

import type { SpecWatcherParams } from '../globals';

const { readFile } = fs;

export default class Diff extends Command {
  static description = 'Find diff between two asyncapi files';

  static flags = {
    help: Flags.help({ char: 'h' }),
    format: Flags.string({
      char: 'f',
      description: 'format of the output',
      default: 'yaml',
      options: ['json', 'yaml', 'yml', 'markdown', 'md'],
    }),
    type: Flags.string({
      char: 't',
      description: 'type of the output',
      default: 'all',
      options: ['breaking', 'non-breaking', 'unclassified', 'all'],
    }),
    markdownSubtype: Flags.string({
      char: 's',
      description: 'output type of changes in markdown format',
      default: 'json',
      options: ['json', 'yaml', 'yml']
    }),
    overrides: Flags.string({
      char: 'o',
      description: 'path to JSON file containing the override properties',
    }),
    'no-error': Flags.boolean({
      description: 'don\'t show error on breaking changes',
    }),
    watch: watchFlag(),
    ...validationFlags({ logDiagnostics: false }),
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

  /* eslint-disable sonarjs/cognitive-complexity */
  async run() {
    const { args, flags } = await this.parse(Diff); // NOSONAR
    const firstDocumentPath = args['old'];
    const secondDocumentPath = args['new'];

    const outputFormat = flags['format'];
    const outputType = flags['type'];
    const overrideFilePath = flags['overrides'];
    const markdownSubtype = flags['markdownSubtype'];
    const watchMode = flags['watch'];
    const noError = flags['no-error'];
    let firstDocument: Specification, secondDocument: Specification;

    try {
      firstDocument = await load(firstDocumentPath);
      enableWatch(watchMode, {
        spec: firstDocument,
        handler: this,
        handlerName: 'diff',
        docVersion: 'old',
        label: 'DIFF_OLD',
      });
    } catch (err) {
      if (err instanceof SpecificationFileNotFound) {
        this.error(
          new ValidationError({
            type: 'invalid-file',
            filepath: firstDocumentPath,
          })
        );
      }
      this.error(err as Error);
    }

    try {
      secondDocument = await load(secondDocumentPath);
      enableWatch(watchMode, {
        spec: secondDocument,
        handler: this,
        handlerName: 'diff',
        docVersion: 'new',
        label: 'DIFF_NEW',
      });
    } catch (err) {
      if (err instanceof SpecificationFileNotFound) {
        this.error(
          new ValidationError({
            type: 'invalid-file',
            filepath: secondDocumentPath,
          })
        );
      }
      this.error(err as Error);
    }

    let overrides: Awaited<ReturnType<typeof readOverrideFile>> = {};
    if (overrideFilePath) {
      try {
        overrides = await readOverrideFile(overrideFilePath);
      } catch (err) {
        this.error(err as Error);
      }
    }

    try {
      const parsed = await parseDocuments(this, firstDocument, secondDocument, flags);
      if (!parsed) {
        return;
      }

      const diffOutput = diff.diff(
        parsed.firstDocumentParsed.json(),
        parsed.secondDocumentParsed.json(),
        {
          override: overrides,
          outputType: outputFormat as diff.OutputType, // NOSONAR
          markdownSubtype: markdownSubtype as diff.MarkdownSubtype
        }
      );

      if (outputFormat === 'json') {
        this.outputJSON(diffOutput, outputType);
      } else if (outputFormat === 'yaml' || outputFormat === 'yml') {
        this.outputYAML(diffOutput, outputType);
      } else if (outputFormat === 'markdown' || outputFormat === 'md') {
        this.outputMarkdown(diffOutput, outputType);
      } else {
        this.log(
          `The output format ${outputFormat} is not supported at the moment.`
        );
      }
      if (!noError) {
        throwOnBreakingChange(diffOutput, outputFormat);
      }
    } catch (error) {
      if (error instanceof DiffBreakingChangeError) {
        this.error(error);
      } 
      throw new ValidationError({
        type: 'parser-error',
        err: error,
      });
    }
  }

  outputJSON(diffOutput: AsyncAPIDiff, outputType: string) {
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

  outputYAML(diffOutput: AsyncAPIDiff, outputType: string) {
    if (outputType === 'breaking') {
      this.log(diffOutput.breaking() as string);
    } else if (outputType === 'non-breaking') {
      this.log(diffOutput.nonBreaking() as string);
    } else if (outputType === 'unclassified') {
      this.log(diffOutput.unclassified() as string);
    } else if (outputType === 'all') {
      this.log(diffOutput.getOutput() as string);
    } else {
      this.log(`The output type ${outputType} is not supported at the moment.`);
    }
  }

  // eslint-disable-next-line sonarjs/no-identical-functions
  outputMarkdown(diffOutput: AsyncAPIDiff, outputType: string) {
    if (outputType === 'breaking') {
      this.log(diffOutput.breaking() as string);
    } else if (outputType === 'non-breaking') {
      this.log(diffOutput.nonBreaking() as string);
    } else if (outputType === 'unclassified') {
      this.log(diffOutput.unclassified() as string);
    } else if (outputType === 'all') {
      this.log(diffOutput.getOutput() as string);
    } else {
      this.log(`The output type ${outputType} is not supported at the moment.`);
    }
  }
}

async function parseDocuments(command: Command, firstDocument: Specification, secondDocument: Specification, flags: Record<string, any>) {
  const { document: newFirstDocumentParsed, status: firstDocumentStatus } = await parse(command, firstDocument, flags);
  const { document: newSecondDocumentParsed, status: secondDocumentStatus } = await parse(command, secondDocument, flags);

  if (!newFirstDocumentParsed || !newSecondDocumentParsed || firstDocumentStatus === 'invalid' || secondDocumentStatus === 'invalid') {
    return;
  }

  const firstDocumentParsed = convertToOldAPI(newFirstDocumentParsed);
  const secondDocumentParsed = convertToOldAPI(newSecondDocumentParsed);
  return { firstDocumentParsed, secondDocumentParsed };
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
const enableWatch = (status: boolean, watcher: SpecWatcherParams) => {
  if (status) {
    specWatcher(watcher);
  }
};

/**
 * Throws `DiffBreakingChangeError` when breaking changes are detected
 */
function throwOnBreakingChange(diffOutput: AsyncAPIDiff, outputFormat: string) {
  const breakingChanges = diffOutput.breaking();
  if (
    (outputFormat === 'json' && breakingChanges.length !== 0) || 
    ((outputFormat === 'yaml' || outputFormat === 'yml') && breakingChanges !== '[]\n')
  ) {
    throw new DiffBreakingChangeError();
  } 
}
