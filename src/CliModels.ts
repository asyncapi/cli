export type Command = string | undefined;
export type HelpMessage = string;
export type Arguments = string[];

export interface Options {
  context?: string,
  watch: boolean,
  file?: string
}

export class CliInput {
  private readonly _command: Command
  private readonly _options: Options
  private readonly _arguments: Arguments
  private readonly _help: boolean | undefined

  private constructor(command: Command, options: Options, args: Arguments, help?:boolean) {
    this._command = command;
    this._options = options;
    this._arguments = args;
    this._help = help;
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

  get help(): boolean | undefined {
    return this._help;
  }

  static createFromMeow(meowOutput: any): CliInput {
    const [command, ...args] = meowOutput.input;
    const { context, watch, file } = meowOutput.flags;
    return new CliInput(command, { context, watch, file }, args, meowOutput.flags.help);
  }

  static createSubCommand(cliInput: CliInput): CliInput {
    const [command, ...args] = cliInput.arguments;
    return new CliInput(command, cliInput.options, args);
  }
}

