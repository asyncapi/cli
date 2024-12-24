import { Flags } from '@oclif/core';
import { validationFlags } from '../parser';
import { watchFlag } from './global.flags';

export const validateFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag(),
    ...validationFlags(),
    score: Flags.boolean({
      description: 'Compute the score of the AsyncAPI document. Scoring is based on whether the document has description, license, server and/or channels.',
      required: false,
      default: false
    }),
    proxyHost: Flags.string({
      required: false,
      description: 'Name of the ProxyHost',
    }),
    proxyPort: Flags.string({
      description: 'Port number number for the proxyHost.',
      required: false
    })
    
  };
};
