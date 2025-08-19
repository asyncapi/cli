import { Flags } from '@oclif/core';

export const proxyFlags = () => {
  return {
    proxyHost: Flags.string({
      description: 'Name of the ProxyHost',
      required: false,
    }),
    proxyPort: Flags.string({
      description: 'Port number number for the proxyHost.',
      required: false,
    }),
  };
};
