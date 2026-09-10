import { Flags } from '@oclif/core';

export const studioFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    file: Flags.string({
      char: 'f',
      description: 'path to the AsyncAPI file to link with Studio',
      deprecated: true,
    }),
    port: Flags.string({
      char: 'p',
      description: 'port in which to start Studio',
    }),
    'no-interactive': Flags.boolean({
      description: 'disable prompts for this command which asks for file path if not passed via the arguments.',
      required: false,
      default: false,
    }),
    'no-browser': Flags.boolean({
      description: 'Do not automatically open Studio in the browser',
      default: false,
    }),
  };
};
