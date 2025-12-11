import { sharedFlags } from './sharedFlags';
import { Flags } from '@oclif/core';

export const fromTemplateFlags = () => {
  return {
    ...sharedFlags,
  };
};
