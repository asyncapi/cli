import { Flags } from '@oclif/core';

export const convertFlags = (latestVersion: string) => {
  return {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({ char: 'o', description: 'path to the file where the result is saved' }),
    'target-version': Flags.string({ char: 't', description: 'asyncapi version to convert to', default: latestVersion })
  };
};
