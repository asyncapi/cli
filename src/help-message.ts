import { injectable, container } from 'tsyringe';

export type CommandName = 'validate' | 'context';

export type Command = {
  [name in CommandName]: {
    usage: string;
    shortDescription: string;
    longDescription?: string;
    flags: string[];
    subCommands?: string[];
  };
};

@injectable()
export class HelpMessage {
  private helpFlag = '-h, --help  display help for command';

  readonly usage: string = 'asyncapi [options] [command]';

  readonly flags = [
    this.helpFlag,
    '-v, --version  output the version number',
  ];

  readonly commands: Command = {
    validate: {
      usage: 'asyncapi validate [options]',
      shortDescription: 'Validate asyncapi file',
      flags: [
        this.helpFlag,
        '-f, --file <spec-file-path>  Path of the AsyncAPI file',
        '-c, --context <saved-context-name>  Context to use',
        '-w, --watch  Watch mode'
      ]
    },
    context: {
      usage: 'asyncapi context [command] [options]',
      shortDescription: 'Manage context',
      longDescription: 'Context is what makes it easier for you to work with multiple AsyncAPI files.\nYou can add multiple different files to a context.\nThis way you do not have to pass --file flag with path to the file every time but just --context flag with reference name.\nYou can also set a default context, so neither --file nor --context flags are needed',
      flags: [this.helpFlag],
      subCommands: [
        'list  list all saved contexts',
        'current  see current context',
        'use <context-name>  set given context as default/current',
        'add <context-name> <spec-file-path>  add/update context',
        'remove <context-name>  remove a context'
      ]
    }
  }
}

export class HelpMessageBuilder {
  private helpMessage: HelpMessage = container.resolve(HelpMessage);

  showHelp() {
    let helpText = '';
    helpText += `usage: ${this.helpMessage.usage}\n\n`;
    helpText += 'flags:\n';
    for (const flag of this.helpMessage.flags) {
      helpText += ` ${flag}\n`;
    }
    helpText += '\n';

    if (this.helpMessage.commands) {
      helpText += 'commands:\n';
      for (const [name, obj] of Object.entries(this.helpMessage.commands)) {
        helpText += ` ${name} [options] [command] ${obj.shortDescription}\n`;
      }
    }

    return helpText;
  }

  showCommandHelp(command: CommandName) {
    let helpText = '';
    const commandHelpObject = this.helpMessage.commands[command as CommandName];
    helpText += `usage: ${commandHelpObject.usage}\n\n`;

    if (commandHelpObject.longDescription) {
      helpText += `${commandHelpObject.longDescription}\n\n`;
    }

    helpText += 'flags: \n';
    for (const flag of commandHelpObject.flags) {
      helpText += ` ${flag}\n`;
    }

    if (commandHelpObject.subCommands) {
      helpText += '\n';
      helpText += 'commands:\n';
      for (const command of commandHelpObject.subCommands) {
        helpText += ` ${command}\n`;
      }
    }

    return helpText;
  }
}
