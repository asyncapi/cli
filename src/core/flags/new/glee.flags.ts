import { Flags } from '@oclif/core';

export const gleeFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    name: Flags.string({
      char: 'n',
      description: 'Name of the Project',
      default: 'project',
    }),
    template: Flags.string({
      char: 't',
      description: 'Name of the Template',
      default: 'default',
    }),
    file: Flags.string({
      char: 'f',
      description:
        'The path to the AsyncAPI file for generating a Glee project.',
    }),
    'force-write': Flags.boolean({
      default: false,
      description:
        'Force writing of the generated files to given directory even if it is a git repo with unstaged files or not empty dir (defaults to false)',
    }),
  };
};
