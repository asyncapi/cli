import { Flags } from '@oclif/core';
import { validationFlags } from '../../parser';
import { ModelinaFlags } from '@asyncapi/modelina-cli';

export const modelsFlags = (): Record<string, any> => {
  return {
    ...ModelinaFlags,
    'no-interactive': Flags.boolean({
      description: 'Disable interactive mode and run with the provided flags.',
      required: false,
      default: false,
    }),
    ...validationFlags({ logDiagnostics: false }),
  };
};
