import { Flags } from '@oclif/core';

export const analyticsFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    disable: Flags.boolean({
      char: 'd',
      description: 'disable analytics',
      default: false,
      exclusive: ['enable'],
    }),
    enable: Flags.boolean({
      char: 'e',
      description: 'enable analytics',
      default: false,
      exclusive: ['disable'],
    }),
    status: Flags.boolean({
      char: 's',
      description: 'show current status of analytics',
    }),
  };
};
