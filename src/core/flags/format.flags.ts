import { Flags } from '@oclif/core';

export type fileFormat = 'yaml' | 'yml' | 'json';

const availFileFormats: fileFormat[] = ['yaml', 'yml', 'json'];

export const convertFormatFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    format: Flags.string({
      char: 'f',
      description: 'Specify the format to convert to',
      options: availFileFormats,
      required: true,
      default: 'json',
    }),
    output: Flags.string({
      char: 'o',
      description: 'path to the file where the result is saved',
    }),
  };
};
