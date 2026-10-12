import { Flags } from '@oclif/core';

export const studioInstallFlag = () =>
  Flags.boolean({
    char: 'y',
    description:
      'automatically install Studio on-demand (~450MB) without prompting. Can also be set via ASYNCAPI_STUDIO_AUTO_INSTALL=1.',
    required: false,
    default: false,
  });
