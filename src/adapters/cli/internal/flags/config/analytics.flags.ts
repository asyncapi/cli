import { Flags } from '@oclif/core';

export const analyticsFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    disable: Flags.boolean({ char: 'd', description: 'disable analytics', default: false }),
    enable: Flags.boolean({ char: 'e', description: 'enable analytics', default: false }),
    status: Flags.boolean({ char: 's', description: 'show current status of analytics' }),
  };
};

