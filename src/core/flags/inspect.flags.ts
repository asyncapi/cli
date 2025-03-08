import { Flags } from '@oclif/core';

export const inspectFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
  };
};
