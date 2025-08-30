import { Args } from '@oclif/core';

export const generateArgs = {
  asyncapi: Args.string({
    description: '- Local path, url or context-name pointing to AsyncAPI file',
    required: false
  })
};
