/* eslint-disable sonarjs/no-duplicate-string */
export const breakingChanges = [
  {
    action: 'remove',
    path: '/channels/mychannel',
    type: 'breaking',
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
          'x-parser-message-name': 'channelMessage',
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
          'x-some-extension': 'some extension',
        },
      },
    },
  },
  {
    action: 'edit',
    path: '/info/version',
    type: 'breaking',
    after: '1.1.0',
    before: '1.0.0',
  },
];

export const nonBreakingChanges = [
  {
    action: 'add',
    path: '/channels/anotherChannel',
    type: 'non-breaking',
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
          'x-parser-message-name': 'channelMessage',
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
          'x-some-extension': 'some extension',
        },
      },
    },
  },
];

export const diffOutput = {
  changes: [
    {
      action: 'remove',
      path: '/channels/mychannel',
      type: 'breaking',
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
            'x-parser-message-name': 'channelMessage',
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
            'x-some-extension': 'some extension',
          },
        },
      },
    },
    {
      action: 'add',
      path: '/channels/anotherChannel',
      type: 'non-breaking',
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
            'x-parser-message-name': 'channelMessage',
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
            'x-some-extension': 'some extension',
          },
        },
      },
    },
    {
      action: 'edit',
      path: '/info/version',
      type: 'breaking',
      after: '1.1.0',
      before: '1.0.0',
    },
  ],
};

export const diffOutputV3 = {
  changes: [
    {
      action: 'edit',
      after: '1.1',
      before: '1.0',
      path: '/components/operations/sendUserSignUp/channel/servers/0/protocolVersion',
      type: 'unclassified',
    },
    {
      action: 'edit',
      after: 'rabbitmq.in.mycompany.com:5673',
      before: 'rabbitmq.in.mycompany.com:5672',
      path: '/components/operations/sendUserSignUp/channel/servers/0/host',
      type: 'unclassified',
    },
    {
      action: 'edit',
      after: '1.1',
      before: '1.0',
      path: '/operations/sendUserSignUp/channel/servers/0/protocolVersion',
      type: 'unclassified',
    },
    {
      action: 'edit',
      after: 'rabbitmq.in.mycompany.com:5673',
      before: 'rabbitmq.in.mycompany.com:5672',
      path: '/operations/sendUserSignUp/channel/servers/0/host',
      type: 'unclassified',
    },
    {
      action: 'edit',
      after: 'A short description',
      before: 'A longer description',
      path: '/operations/sendUserSignUp/description',
      type: 'non-breaking',
    },
    {
      action: 'edit',
      after: '1.1',
      before: '1.0',
      path: '/channels/user/servers/0/protocolVersion',
      type: 'unclassified',
    },
    {
      action: 'edit',
      after: 'rabbitmq.in.mycompany.com:5673',
      before: 'rabbitmq.in.mycompany.com:5672',
      path: '/channels/user/servers/0/host',
      type: 'unclassified',
    },
    {
      action: 'edit',
      after: '1.1',
      before: '1.0',
      path: '/servers/production/protocolVersion',
      type: 'breaking',
    },
    {
      action: 'edit',
      after: 'rabbitmq.in.mycompany.com:5673',
      before: 'rabbitmq.in.mycompany.com:5672',
      path: '/servers/production/host',
      type: 'breaking',
    },
    {
      action: 'edit',
      after: 'World',
      before: 'Hello',
      path: '/info/contact/name',
      type: 'non-breaking',
    },
  ],
};

export const overrides = {
  '/channels/*': {
    add: 'breaking',
    remove: 'non-breaking',
    edit: 'unclassified',
  },
  '/info/version': {
    add: 'breaking',
    remove: 'non-breaking',
    edit: 'unclassified',
  },
};

export const changesWithOverrides = {
  changes: [
    {
      action: 'remove',
      path: '/channels/mychannel',
      type: 'non-breaking',
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
            'x-parser-message-name': 'channelMessage',
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
            'x-some-extension': 'some extension',
          },
        },
      },
    },
    {
      action: 'add',
      path: '/channels/anotherChannel',
      type: 'breaking',
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
            'x-parser-message-name': 'channelMessage',
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
            'x-some-extension': 'some extension',
          },
        },
      },
    },
    {
      action: 'edit',
      path: '/info/version',
      type: 'unclassified',
      after: '1.1.0',
      before: '1.0.0',
    },
  ],
};

export const specDocument1 = {
  asyncapi: '2.1.0',
  servers: {
    google: {
      variables: {
        port: {
          enum: [1, 2],
        },
      },
    },
  },
};

export const specDocument2 = {
  asyncapi: '2.1.0',
  servers: {
    google: {
      variables: {
        port: {
          enum: [1],
        },
      },
    },
  },
};

export const arrayChanges = {
  changes: [
    {
      path: '/servers/google/variables/port/enum/1',
      type: 'breaking',
      isArrayIndex: true,
      action: 'remove',
      before: 2,
    },
  ],
};

export const YAMLArrayChanges = `changes:
  - action: remove
    path: /servers/google/variables/port/enum/1
    isArrayIndex: true
    before: 2
    type: breaking
`;

export const MarkdownArrayChanges = `## Breaking


 - **Path**: \`/servers/google/variables/port/enum/1\`
     - **Action**: remove
     - **IsArrayIndex**: true
     - **Before**: 2
    
`;
