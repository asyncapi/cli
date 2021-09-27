import {Command, flags} from '@oclif/command'
import {loadContextFile} from '../../models/Context'

export default class ContextCurrent extends Command {
  static description = 'see current context'
  
  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    try {
      const ctx = loadContextFile()
      console.log(`You're currently using context "${ctx.current}".`)
    } catch (error) {
      throw error
    }
  }
}
