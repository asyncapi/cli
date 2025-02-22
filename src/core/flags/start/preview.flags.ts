import { Flags } from '@oclif/core';

export const previewFlags = () => {
  return {
    help: Flags.help({ char: 'h' ,description: 'Show CLI help'}),
    port: Flags.integer({ char: 'p', description: 'port in which to start Studio' }),
  };
};
