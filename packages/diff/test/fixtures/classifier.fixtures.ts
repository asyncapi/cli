/* eslint-disable sonarjs/no-duplicate-string */
export const demoStandard = {
  '/servers': {
    add: 'non-breaking',
    remove: 'breaking',
    edit: 'breaking',
  },
  '/servers/*': {
    add: 'non-breaking',
    remove: 'breaking',
    edit: 'breaking',
  },
  '/servers/*/protocol': {
    add: 'non-breaking',
    remove: 'breaking',
    edit: 'breaking',
  },
};

export const correctClassification = {
  add: 'non-breaking',
  remove: 'breaking',
  edit: 'breaking',
};

export const unclassifiedChange = {
  add: 'unclassified',
  remove: 'unclassified',
  edit: 'unclassified',
};
