import { Flags } from '@oclif/core';

export const watchFlag = Flags.boolean({
  char: 'w',
  description: 'Enable watch mode'
});
