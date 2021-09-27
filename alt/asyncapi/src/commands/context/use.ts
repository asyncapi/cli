import {Command, flags} from '@oclif/command'
import {loadContextFile, updateCurrent} from '../../models/Context'

export default class ContextUse extends Command {
  static description = 'set given context as default/current'
  
  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{
    name: 'context-name'
  }]

  async run() {
    const {args, flags} = this.parse(ContextUse)
    const contextName = args['context-name']

    try {
      const ctx = loadContextFile()
      updateCurrent(ctx, contextName)
      console.log(`You're now using context ${contextName}.`)
    } catch (error) {
      throw error
    }
  }
}
