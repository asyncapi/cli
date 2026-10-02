export const standard = {
  '/servers': {
    add: 'non-breaking',
    remove: 'breaking',
    edit: 'breaking',
  },
};

export const inputDiffOutput = [
  {
    action: 'remove',
    path: '/servers',
  },
];

export const finalDiffOutput = {
  changes: [
    {
      action: 'remove',
      path: '/servers',
      type: 'breaking',
    },
  ],
};

export const finalDiffOutputAsUnclassified = {
  changes: [
    {
      action: 'remove',
      path: '/servers',
      type: 'unclassified',
    },
  ],
};
