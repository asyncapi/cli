import { Flags } from '@oclif/core';

export const bundleFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({
      char: 'o',
      description:
        'The output file name. Omitting this flag the result will be printed in the console.',
    }),
    base: Flags.string({
      char: 'b',
      description:
        'Path to the file which will act as a base. This is required when some properties need to be overwritten.',
    }),
    baseDir: Flags.string({
      char: 'd',
      description:
        'One relative/absolute path to directory relative to which paths to AsyncAPI Documents that should be bundled will be resolved.',
    }),
    xOrigin: Flags.boolean({
      char: 'x',
      description:
        'Pass this switch to generate properties "x-origin" that will contain historical values of dereferenced "$ref"s.',
    }),
  };
};
