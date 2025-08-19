import { sharedFlags } from './sharedFlags';
import { Flags } from '@oclif/core';

export const fromTemplateFlags = () => {
  return {
    ...sharedFlags,
    'use-new-generator': {
      default: false,
      description: 'Use v2 generator, for generating from newer templates',
      ...Flags.boolean(),
    },
  };
};
