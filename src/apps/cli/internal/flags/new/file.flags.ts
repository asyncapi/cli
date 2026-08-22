import { Flags } from '@oclif/core';

export const fileFlags = (exampleFlagDescription: string) => {
  return {
    help: Flags.help({ char: 'h' }),
    'file-name': Flags.string({ char: 'n', description: 'name of the file' }),
    example: Flags.string({ char: 'e', description: exampleFlagDescription }),
    studio: Flags.boolean({ char: 's', description: 'open in Studio' }),
    yes: Flags.boolean({
      char: 'y',
      description: 'automatically install Studio on-demand (~450MB) without prompting when opening in Studio. Can also be set via ASYNCAPI_STUDIO_AUTO_INSTALL=1.',
    }),
    port: Flags.integer({
      char: 'p',
      description: 'port in which to start Studio',
    }),
    'no-tty': Flags.boolean({
      description: 'do not use an interactive terminal',
    }),
  };
};
