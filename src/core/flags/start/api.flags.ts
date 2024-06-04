import { Flags } from '@oclif/core';

export const apiFlags = (defaultPort: number) => {
  return {
    help: Flags.help({ char: 'h' }),
    port: Flags.integer({ char: 'p', description: 'port in which to start API', default: defaultPort }),
  };
};
