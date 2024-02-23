import { Flags } from '@oclif/core';

export const watchFlag = (description?: string) => {
  return Flags.boolean({
    default: false,
    char: 'w',
    description: description ?? 'Enable watch mode',
  });
};
