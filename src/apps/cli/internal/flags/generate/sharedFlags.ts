import { Flags } from '@oclif/core';
import { watchFlag } from '../global.flags';

export const sharedFlags = {
  help: Flags.help({ char: 'h' }),
  'disable-hook': Flags.string({
    char: 'd',
    description: 'Disable a specific hook type or hooks from a given hook type',
    multiple: true
  }),
  'no-interactive': Flags.boolean({
    description: 'Disable interactive mode and run with the provided flags.',
    default: false,
  }),
  install: Flags.boolean({
    char: 'i',
    default: false,
    description: 'Installs the template and its dependencies (defaults to false)'
  }),
  debug: Flags.boolean({
    description: 'Enable more specific errors in the console'
  }),
  'no-overwrite': Flags.string({
    char: 'n',
    multiple: true,
    description: 'Glob or path of the file(s) to skip when regenerating'
  }),
  output: Flags.string({
    char: 'o',
    description: 'Directory where to put the generated files (defaults to current directory)',
  }),
  'force-write': Flags.boolean({
    default: false,
    description: 'Force writing of the generated files to given directory even if it is a git repo with unstaged files or not empty dir (defaults to false)'
  }),
  watch: watchFlag(
    'Watches the template directory and the AsyncAPI document, and re-generate the files when changes occur. Ignores the output directory.'
  ),
  param: Flags.string({
    char: 'p',
    description: 'Additional param to pass to templates (e.g., --param sidebarOrganization=byTags)',
    multiple: true
  }),
  'map-base-url': Flags.string({
    description: 'Maps all schema references from base url to local folder'
  }),
  'registry-url': Flags.string({
    default: 'https://registry.npmjs.org',
    description: 'Specifies the URL of the private registry for fetching templates and dependencies'
  }),
  'registry-auth': Flags.string({
    description: 'The registry username and password encoded with base64, formatted as username:password'
  }),
  'registry-token': Flags.string({
    description: 'The npm registry authentication token, that can be passed instead of base64 encoded username and password'
  }),
};
