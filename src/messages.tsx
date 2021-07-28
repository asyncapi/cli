export const NO_CONTEXTS_SAVED = 'No contexts saved yet, run asyncapi --help to know more';

export const CONTEXT_NOT_FOUND = 'This context key does not exists.';

export const KEY_NOT_FOUND = 'Key not found';

export const DELETING_CURRENT_CONTEXT = 'You are tyring to delete a context that is currently in use.';

export const MISSING_CURRENT_CONTEXT = 'No context is set as current, please set a current context.';

export const MISSING_ARGUMENTS = 'Missing arguments.';

export interface CommandHelp {
  name: string,
  usage: string,
  shortDescription?: string,
  longDescription?: string,
  flags?: string[],
  commands?: string[]
}

export class Help {
  private _helpFlag = '-h, --help  display help for command';
  private root: CommandHelp = {
    name: 'root',
    usage: 'asyncapi [options] [command]',
    flags: [
      this._helpFlag,
      '-v, -version  output the version number'
    ]
  }

  private validate: CommandHelp = {
    name: 'validate',
    usage: 'asyncapi validate [options]',
    shortDescription: 'Validate an asyncapi file',
    flags: [
      '-f, --file <spec-file-path>  Path of the spec file',
      '-c, --context <saved-context-name>  Context name to use',
      '-w, --watch  watch mode',
      this._helpFlag
    ]
  }

  private context: CommandHelp = {
    name: 'context',
    usage: 'asyncapi context [options] [command]',
    shortDescription: 'Manage contexts',
    flags: [
      this._helpFlag
    ],
    commands: [
      'list  list all saved contexts',
      'current  see current context',
      'use <context-name>  set a context as current',
      'add <context-name> <spec-file-path>  add/update context',
      'remove <context-name>  remove a context'
    ]
  }

  rootHelp(): string {
    let helpString = '';
    helpString += `usage: ${this.root.usage}\n\n`;
    helpString += 'options:\n';
    if (this.root.flags) {
      for (const flag of this.root.flags) {
        helpString += ` ${flag} \n`;
      }
    }

    helpString += '\n';

    helpString += 'commads:\n';
    helpString += ` context [options] [command]  ${this.context.shortDescription} \n`;
    helpString += ` validate [options]  ${this.validate.shortDescription}\n`;
    return helpString;
  }
}
