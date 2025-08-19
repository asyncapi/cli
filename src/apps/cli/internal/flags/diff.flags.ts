import { Flags } from '@oclif/core';
import { watchFlag } from './global.flags';
import { parserFlags } from './parser.flags';

export const diffFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    format: Flags.string({
      char: 'f',
      description: 'format of the output',
      default: 'yaml',
      options: ['json', 'yaml', 'yml', 'md'],
    }),
    type: Flags.string({
      char: 't',
      description: 'type of the output',
      default: 'all',
      options: ['breaking', 'non-breaking', 'unclassified', 'all'],
    }),
    markdownSubtype: Flags.string({
      description:
        'the format of changes made to AsyncAPI document. It works only when diff is generated using md type. For example, when you specify subtype as json, then diff information in markdown is dumped as json structure.',
      default: undefined,
      options: ['json', 'yaml', 'yml'],
    }),
    overrides: Flags.string({
      char: 'o',
      description: 'path to JSON file containing the override properties',
    }),
    'no-error': Flags.boolean({
      description: 'don\'t show error on breaking changes',
    }),
    watch: watchFlag(),
    ...parserFlags({ logDiagnostics: false }),
  };
};
