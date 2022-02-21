import { flags } from '@oclif/command';

export const watchFlag = flags.boolean({
  char: 'w',
  description: 'Enable watch mode'
});
