import { Flags } from '@oclif/core';
import { validationFlags } from '../parser';
import { watchFlag } from './global.flags';

export const validateFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag(),
    ...validationFlags(),
    score: Flags.boolean({
      description: 'Compute the score of the AsyncAPI document, scoring is based on whether the document description, License, server and channels.',
      required: false,
      default: false
    })
  };
};
