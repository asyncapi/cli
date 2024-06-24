import { Flags } from '@oclif/core';

export enum Optimizations {
  REMOVE_COMPONENTS='remove-components',
  REUSE_COMPONENTS='reuse-components',
  MOVE_DUPLICATES_TO_COMPONENTS='move-duplicates-to-components',
  MOVE_ALL_TO_COMPONENTS='move-all-to-components',
}

export enum DisableOptimizations {
  SCHEMA='schema',
}

export enum Outputs {
  TERMINAL='terminal',
  NEW_FILE='new-file',
  OVERWRITE='overwrite'
}

export const optimizeFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    optimization: Flags.string({char: 'p', default: Object.values(Optimizations), options: Object.values(Optimizations), multiple: true, description: 'select the type of optimizations that you want to apply.'}),
    ignore: Flags.string({char: 'i', default: [], options: Object.values(DisableOptimizations), multiple: true, description: 'list of components to be ignored from the optimization process'}),
    output: Flags.string({char: 'o', default: Outputs.TERMINAL, options: Object.values(Outputs), description: 'select where you want the output.'}),
    'no-tty': Flags.boolean({ description: 'do not use an interactive terminal', default: false }),
  };
};
