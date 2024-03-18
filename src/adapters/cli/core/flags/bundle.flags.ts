import { Flags } from '@oclif/core';

export const bundleFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({ char: 'o', description: 'The output file name. Omitting this flag the result will be printed in the console.' }),
    'reference-into-components': Flags.boolean({ char: 'r', description: 'Bundle the message $refs into components object.' }),
    base: Flags.string({ char: 'b', description: 'Path to the file which will act as a base. This is required when some properties are to needed to be overwritten.' }),
  };
};
