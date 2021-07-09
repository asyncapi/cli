
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
  private readonly _arguments: Arguments

  private constructor(command: Command, options: Options, args: Arguments) {
    this._command = command;
    this._options = options;
    this._arguments = args;
  }

  get command(): Command {
    return this._command;
  }

  get options(): Options {
    return this._options;
  }


  get arguments(): Arguments {
    return this._arguments;
  }

  static createFromMeow(meowOutput: any): CliInput {
    const [command, ...args] = meowOutput.input;
    const { context, watch } = meowOutput.flags;
    return new CliInput(command || 'help', { context, watch }, args);
  }

  static createSubCommand(cliInput: CliInput): CliInput {
    const [command, ...args] = cliInput.arguments;
    return new CliInput(command || 'help', cliInput.options, args);
  }
}

