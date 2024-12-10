import { Flags } from '@oclif/core';

export const proxyFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    http_proxy: Flags.string({ string: 'http_proxy', description: 'add http_proxy', default: '' }),
    https_proxy: Flags.string({ string: 'https_proxy', description: 'add https_proxy', default: '' }),
    no_proxy: Flags.boolean({ description: 'Remove all the proxies from the environment', default: false }),

  };
};

