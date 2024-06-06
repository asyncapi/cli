import { Flags } from '@oclif/core';
import { validationFlags } from '../parser';
import { watchFlag } from './global.flags';

export const validateFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag(),
    ...validationFlags(),
  };
};
