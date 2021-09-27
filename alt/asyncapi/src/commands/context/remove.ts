import {Command, flags} from '@oclif/command'
import {loadContextFile, deleteContext} from '../../models/Context'

export default class ContextRemove extends Command {
  static description = 'remove a context'
  
  static aliases = ['context:rm']

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{
    name: 'context-name'
  }]

  async run() {
    const {args, flags} = this.parse(ContextRemove)
    const contextName = args['context-name']

    try {
      const ctx = loadContextFile()
      deleteContext(ctx, contextName)
      console.log(`Context "${contextName}" has been removed.`)
    } catch (error) {
      throw error
    }
  }
}
