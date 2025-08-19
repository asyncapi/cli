import { Flags } from '@oclif/core';

export const addFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    'set-current': Flags.boolean({
      char: 's',
      description: 'Set context being added as the current context',
      default: false,
      required: false,
    }),
  };
};
