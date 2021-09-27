import {Command, flags} from '@oclif/command'

export default class Context extends Command {  
  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    this._help()
  }
}
