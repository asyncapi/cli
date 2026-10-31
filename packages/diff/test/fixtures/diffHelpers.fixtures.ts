/* eslint-disable sonarjs/no-duplicate-string */
export const firstDocument = {
  servers: {
    production: {
      name: 'production',
      enum: [1, 2, 3],
    },
  },
};

export const modifyDiffInput = {
  servers: {
    production: {
      protocol: 'http',
    },
  },
};

export const diffAdd = [
  {
    op: 'add',
    path: '/servers/production/protocol',
    value: 'https',
  },
];

export const diffAddOutput = [
  { action: 'add', path: '/servers/production/protocol', after: 'https' },
];

export const diffRemove = [
  {
    op: 'remove',
    path: '/servers/production/protocol',
  },
];

export const diffRemoveOutput = [
  {
    action: 'remove',
    path: '/servers/production/protocol',
    before: 'http',
  },
];

export const diffEdit = [
  {
    op: 'replace',
    path: '/servers/production/protocol',
    value: 'https',
  },
];

export const diffEditOutput = [
  {
    action: 'edit',
    path: '/servers/production/protocol',
    before: 'http',
    after: 'https',
  },
];
