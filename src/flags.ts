import { Flags } from '@oclif/core';

export const watchFlag = Flags.boolean({
  char: 'w',
  description: 'Enable watch mode'
});

export const outputFlag = Flags.string({
  char: 'o',
  description: 'Path to the output file'
})