import { Flags } from '@oclif/core';

export const studioFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    port: Flags.integer({ char: 'p', description: 'port in which to start Studio' }),
  };
};
