import meow from 'meow';
import { injectable } from 'tsyringe';

injectable();
export class CLIService {
  private _cli = meow('', { argv: process.argv.slice(2), autoHelp: false })

  command(): string {
    return this._cli.input[0] || '';
  }

  args(): any {
    return this._cli.flags;
  }
}

