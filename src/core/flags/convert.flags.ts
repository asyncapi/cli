import { Flags } from '@oclif/core';

export const convertFlags = (latestVersion: string) => {
  return {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({ char: 'o', description: 'path to the file where the result is saved' }),
    'target-version': Flags.string({ char: 't', description: 'asyncapi version to convert to (for both asyncapi and openapi conversions)', default: latestVersion }),
    perspective: Flags.string({
      char: 'p',
      description: 'perspective to use when converting OpenAPI to AsyncAPI (client or server). Note: This option is only applicable for OpenAPI to AsyncAPI conversions.',
      options: ['client', 'server'],
      default: 'server'
    })
  };
};
