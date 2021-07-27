export const NO_CONTEXTS_SAVED = 'No contexts saved yet, run asyncapi --help to know more';

export const CONTEXT_NOT_FOUND = 'This context key does not exists.';

export const KEY_NOT_FOUND = 'Key not found';

export const DELETING_CURRENT_CONTEXT = 'You are tyring to delete a context that is currently in use.';

export const MISSING_CURRENT_CONTEXT = 'No context is set as current, please set a current context.';

export const MISSING_ARGUMENTS = 'Missing arguments.';

const HELP_FLAG = '-h, --help  display help for command';

export const Help = {
  root: {
    usage: 'asyncapi [options] [command]',
    shortHelp: '',
    options: [
      '-v, --version  output the version number',
      HELP_FLAG
    ]
  },
  validate: {
    usage: 'asyncapi validate [options]',
    options: [
      '-f, --file <spec-path>  Path of the spec file',
      '-c, --context <saved-context-name>  context name to use',
      '-w, --watch  watch mode',
      HELP_FLAG
    ]
  },
  context: {
    usage: 'asyncapi context [options] [command]',
    shortDesc: 'Manage contexts',
    longDesc: 'Store key-value pair of contexts and the CLI will load your contexts \n automatically making your commands shorter',
    options: [
      HELP_FLAG
    ],
    commands: [
      'list  list all saved commands',
      'current  display current context in use',
      'use <context-name>  set context as current context',
      'add <context-name> <spec-path>  add/update context',
      'remove <context-name> remove a context'
    ]
  }
};
