import { Flags } from '@oclif/core';

export const previewFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    port: Flags.integer({ char: 'p', description: 'port in which to start Studio in the preview mode' }),
    base: Flags.string({ char: 'b', description: 'Path to the file which will act as a base. This is required when some properties need to be overwritten while bundling with the file.' }),
    baseDir: Flags.string({ char: 'd', description: 'One relative/absolute path to directory relative to which paths to AsyncAPI Documents that should be bundled will be resolved.' }),
    xOrigin: Flags.boolean({ char: 'x', description: 'Pass this switch to generate properties "x-origin" that will contain historical values of dereferenced "$ref"s.' }),
    detailedLog: Flags.boolean({char: 'l',description: 'Pass this to get detailed logs in case of any error relatd to bundling of files.',default: false})
  };
};
