import { sharedFlags } from './sharedFlags';
import { Flags } from '@oclif/core';

export const fromTemplateFlags = () => {
  return {
    ...sharedFlags,
    compile: Flags.boolean({
      default: true,
      description: 'Compile the template before generating files (defaults to true)',
      allowNo: true,
    })
  };
};
