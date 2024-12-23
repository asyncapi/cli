import { Flags } from '@oclif/core';

export const proxyFlag = () => {
    return {
      proxyHost: Flags.string({
        description: 'Name of the ProxyHost',
      }),
      proxyPort: Flags.string({
        description: "Port number number for the proxyHost."
      })
    }
};


