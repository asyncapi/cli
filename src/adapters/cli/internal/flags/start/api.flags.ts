import { Flags } from '@oclif/core';

export const apiFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    mode: Flags.string({ char: 'm', description: 'mode in which to start the API', default: 'production', options: ['development', 'production', 'test']}),
    port: Flags.integer({ char: 'p', description: 'port in which to start the API' }),
  };
};
