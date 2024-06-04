import { Flags } from '@oclif/core';

export const fileFlags = (exampleFlagDescription: string) => {
  return {
    help: Flags.help({ char: 'h' }),
    'file-name': Flags.string({ char: 'n', description: 'name of the file' }),
    example: Flags.string({ char: 'e', description: exampleFlagDescription }),
    studio: Flags.boolean({ char: 's', description: 'open in Studio' }),
    port: Flags.integer({ char: 'p', description: 'port in which to start Studio' }),
    'no-tty': Flags.boolean({ description: 'do not use an interactive terminal' }),
  };
};
