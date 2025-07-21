import { Flags } from '@oclif/core';

export const convertFlags = (latestVersion: string) => {
  return {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({ char: 'o', description: 'path to the file where the result is saved' }),
    format: Flags.string({
      char: 'f',
      description: 'Specify the format to convert from (openapi or asyncapi)',
      options: ['openapi', 'asyncapi', 'postman-collection'],
      required: true,
      default: 'asyncapi',
    }),
    'target-version': Flags.string({ char: 't', description: 'asyncapi version to convert to', default: latestVersion }),
    perspective: Flags.string({
      char: 'p',
      description: 'Perspective to use when converting OpenAPI to AsyncAPI (client or server). Note: This option is only applicable for OpenAPI to AsyncAPI conversions.',
      options: ['client', 'server'],
      default: 'server',
    }),
  };
};
