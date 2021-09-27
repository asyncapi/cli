import {Command, flags} from '@oclif/command'

import { IContext, loadContextFile } from '../../models/Context'

export default class ContextList extends Command {
  static description = 'list all saved contexts'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args, flags} = this.parse(ContextList)
    const ctx: IContext = loadContextFile()
    const response = Object.keys(ctx.store).map(c => ({ key: c, path: ctx.store[String(c)] }))
    console.log(response)
  }
}
