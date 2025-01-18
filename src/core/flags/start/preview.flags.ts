import { Flags } from '@oclif/core';

export const previewFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    file: Flags.string({
      char: 'f',
      description: 'path to the AsyncAPI file to link with Studio',
    }),
    port: Flags.integer({
      char: 'p',
      description: 'port in which to start Studio',
    }),
  };
};
