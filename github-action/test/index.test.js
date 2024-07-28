
const { paramParser } = require('../lib/utils');

test('should get valid object with parameters', () => {
  expect(paramParser('baseHref=/my-repo-name/ sidebarOrganization=byTags')).toEqual({baseHref: '/my-repo-name/', sidebarOrganization: 'byTags'});
});

test('should fail parsing parameters', () => {
  expect(() => {paramParser('baseHref:/my-repo-name/');}).toThrow(new Error('Invalid param baseHref:/my-repo-name/. It must be in the format of name=value.'));
});

