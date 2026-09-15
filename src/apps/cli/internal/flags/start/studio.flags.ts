import { Flags } from '@oclif/core';
import { studioInstallFlag } from '@cli/internal/flags/studio.flags';

export const studioFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    file: Flags.string({
      char: 'f',
      description: 'path to the AsyncAPI file to link with Studio',
      deprecated: true,
    }),
    port: Flags.string({
      char: 'p',
      description: 'port in which to start Studio',
    }),
    'no-interactive': Flags.boolean({
      description: 'disable prompts for this command which asks for file path if not passed via the arguments.',
      required: false,
      default: false,
    }),
    yes: studioInstallFlag(),
    noBrowser: Flags.boolean({char: 'B', description: 'Pass this to not open browser automatically upon running the command', default: false})
  };
};
