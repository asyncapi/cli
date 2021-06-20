
export type Command = string;
export type HelpMessage = string;
export type Arguments = string[];

export interface Options {
  context: string,
  watch: boolean
}

export class CliInput {
  private readonly _command: Command
  private readonly _options: Options
  private readonly _helpMessage: HelpMessage
  private readonly _arguments: Arguments

  private constructor(command: Command, options: Options, helpMessage: HelpMessage, args: Arguments) {
    this._command = command;
    this._options = options;
    this._helpMessage = helpMessage;
    this._arguments = args;
  }

  get command(): Command {
    return this._command;
  }

  get options(): Options {
    return this._options;
  }

  get helpMessage(): HelpMessage {
    return this._helpMessage;
  }

  get arguments(): Arguments {
    return this._arguments;
  }

  static createFromMeow(meowOutput: any): CliInput {
    const [command, ...args] = meowOutput.input;
    const help = meowOutput.help;
    const { context, watch } = meowOutput.flags;
    return new CliInput(command || 'help', { context, watch }, help, args);
  }
}
