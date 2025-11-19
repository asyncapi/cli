import { Flags } from '@oclif/core';
import { watchFlag } from './global.flags';
import { parserFlags } from './parser.flags';

export const validateFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag(),
    ...parserFlags(),
    score: Flags.boolean({
      description:
        'Compute the score of the AsyncAPI document. Scoring is based on whether the document has description, license, server and/or channels.',
      required: false,
      default: false,
    }),
    suppressWarnings: Flags.string({
      description:
        'List of warning codes to suppress from the validation output.',
      required: false,
      multiple: true,
    }),
    suppressAllWarnings: Flags.boolean({
      description: 'Suppress all warnings from the validation output.',
      required: false,
      default: false,
    }),
    ruleset: Flags.string({
      description:
        'Path to custom Spectral ruleset file (e.g., .spectral.yaml or .spectral.js)',
      required: false,
    }),
  };
};
