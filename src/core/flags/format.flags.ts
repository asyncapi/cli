
import { Flags } from '@oclif/core';

export const formatFlags = () => {
  return {
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
  };
};
