import { Flags } from '@oclif/core';
import { ModelinaFlags } from '@asyncapi/modelina-cli';
import { parserFlags } from '../parser.flags';

export const modelsFlags = (): Record<string, any> => {
  return {
    ...ModelinaFlags,
    'no-interactive': Flags.boolean({
      description: 'Disable interactive mode and run with the provided flags.',
      required: false,
      default: false,
    }),
    ...parserFlags({ logDiagnostics: false }),
  };
};
