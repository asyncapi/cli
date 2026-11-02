/* eslint-disable sonarjs/no-duplicate-string */

export const firstDocument = {
  servers: {
    production: {
      name: 'production',
      enum: [1, 2, 3],
    },
  },
};

export const secondDocument = {
  servers: {
    production: {
      name: 'production-dev',
      enum: [1, 2],
    },
  },
};

export const diffLocalOutput = [
  {
    action: 'remove',
    path: '/servers/production/enum/2',
    isArrayIndex: true,
    before: 3,
  },
  {
    action: 'edit',
    path: '/servers/production/name',
    before: 'production',
    after: 'production-dev',
  },
];

export const diffOutput = [
  {
    action: 'remove',
    path: '/channels/mychannel',
    before: {
      publish: {
        message: {
          headers: {
            properties: {
              'some-common-header': {
                type: 'string',
                'x-parser-schema-id': '<anonymous-schema-2>',
              },
            },
            type: 'object',
            'x-parser-schema-id': '<anonymous-schema-1>',
          },
          traits: [
            {
              headers: {
                properties: {
                  'some-common-header': {
                    type: 'string',
                    'x-parser-schema-id': '<anonymous-schema-7>',
                  },
                },
                type: 'object',
                'x-parser-schema-id': '<anonymous-schema-6>',
              },
              'x-some-extension': 'some extension',
            },
          ],
          'x-parser-message-name': 'channelMessage',
          'x-some-extension': 'some extension',
        },
      },
    },
  },
  {
    action: 'add',
    path: '/channels/anotherChannel',
    after: {
      publish: {
        message: {
          headers: {
            properties: {
              'some-common-header': {
                type: 'string',
                'x-parser-schema-id': '<anonymous-schema-2>',
              },
            },
            type: 'object',
            'x-parser-schema-id': '<anonymous-schema-1>',
          },
          traits: [
            {
              headers: {
                properties: {
                  'some-common-header': {
                    type: 'string',
                    'x-parser-schema-id': '<anonymous-schema-7>',
                  },
                },
                type: 'object',
                'x-parser-schema-id': '<anonymous-schema-6>',
              },
              'x-some-extension': 'some extension',
            },
          ],
          'x-parser-message-name': 'channelMessage',
          'x-some-extension': 'some extension',
        },
      },
    },
  },
  {
    action: 'edit',
    path: '/info/version',
    after: '1.1.0',
    before: '1.0.0',
  },
];
