import { Flags } from '@oclif/core';

export const prettyFlags = () => {
  return {
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
  };
};
