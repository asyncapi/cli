
export type Command = string;
export type HelpMessage = string;

export interface Options {
  context: string,
  watch: boolean
}

export class CliInput {
  private readonly _command: Command
  private readonly _options: Options
  private readonly _helpMessage: HelpMessage

  private constructor(command: Command, options: Options, helpMessage: HelpMessage) {
    this._command = command;
    this._options = options;
    this._helpMessage = helpMessage;
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

  static createFromMeow(meowOutput: any): CliInput {
    const [command] = meowOutput.input;
    const help = meowOutput.help;
    const { context, watch } = meowOutput.flags;
    return new CliInput(command || 'help', { context, watch }, help);
  }
}
