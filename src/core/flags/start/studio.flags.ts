import { Flags } from '@oclif/core';

export const studioFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    file: Flags.string({ char: 'f', description: 'path to the AsyncAPI file to link with Studio', deprecated: true }),
    port: Flags.integer({ char: 'p', description: 'port in which to start Studio' }),
    'no-interactive': Flags.boolean({
      description: 'disables prompts for this command which asks for file path even if not passed via the arguments.',
      required: false,
      default: false,
    }),
  };
};
