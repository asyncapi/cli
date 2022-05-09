import { Flags } from '@oclif/core';

export const watchFlag = (description?: string) => {
  if (!description) {
    description = 'Enable watch node';
  }
  return Flags.boolean({
    char: 'w',
    description
  });
};
