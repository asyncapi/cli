import {
  Output,
  OutputType,
  JSONOutput,
  Changes,
  AsyncAPIDiffOptions,
  MarkdownSubtype,
} from './types';
import { breaking, nonBreaking, unclassified } from './constants';
import toProperFormat from './helpers/output/toProperFormat';

/**
 * Implements methods to deal with diff output.
 * @class
 * 
 * @returns {AsyncAPIDiff} AsyncAPIDiff
 */
export default class AsyncAPIDiff {
  private output: JSONOutput;
  private outputType: OutputType;
  private markdownSubtype: MarkdownSubtype;

  constructor(output: string, options: AsyncAPIDiffOptions) {
    // output is a stringified JSON
    this.output = JSON.parse(output);
    this.outputType = options.outputType;
    this.markdownSubtype = options.markdownSubtype || 'json';
  }

  /**
   * @returns {Changes} All the breaking changes
   */
  breaking(): Changes {
    const breakingChanges = this.output.changes.filter(
      (diff) => diff.type === breaking
    );

    return toProperFormat({data: breakingChanges, outputType: this.outputType, markdownSubtype: this.markdownSubtype});
  }

  /**
   * @returns {Changes} All the non-breaking changes
   */
  nonBreaking(): Changes {
    const nonBreakingChanges = this.output.changes.filter(
      (diff) => diff.type === nonBreaking
    );

    return toProperFormat({data: nonBreakingChanges, outputType: this.outputType, markdownSubtype: this.markdownSubtype});
  }

  /**
   * @returns {Changes} All the unclassified changes
   */
  unclassified(): Changes {
    const unclassifiedChanges = this.output.changes.filter(
      (diff) => diff.type === unclassified
    );

    return toProperFormat({data: unclassifiedChanges, outputType: this.outputType, markdownSubtype: this.markdownSubtype});
  }

  /**
   * @returns {Output}  The full output
   */
  getOutput(): Output {
    return toProperFormat({data: this.output, outputType: this.outputType, markdownSubtype: this.markdownSubtype});
  }
}
