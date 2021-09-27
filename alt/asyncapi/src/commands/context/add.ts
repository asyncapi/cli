import {Command, flags} from '@oclif/command'
import {IContext, loadContextFile, addContext, save, updateCurrent} from '../../models/Context'
import {SpecificationFile} from '../../models/SpecificationFile'
import {ContextFileNotFoundError} from '../../errors/context'

const successMessage = (contextName:string) => 
  `New context added.\n\nYou can set it as your current context: asyncapi context use ${contextName}\nYou can use this context when needed by passing ${contextName} as a parameter: asyncapi validate ${contextName}`

export default class ContextAdd extends Command {
  static description = 'add/update a context'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{
    name: 'context-name'
  }, {
    name: 'asyncapi-file-path'
  }]

  async run() {
    const {args, flags} = this.parse(ContextAdd)
    const contextName = args['context-name']
    const asyncapiFilePath = args['asyncapi-file-path']
    const specFile = new SpecificationFile(asyncapiFilePath)

    try {
      const ctx = loadContextFile()
      const updatedContext = addContext(ctx, contextName, specFile)
      save(updatedContext)
      console.log(successMessage(contextName))
    } catch (error) {
      if (error instanceof ContextFileNotFoundError) {
        const context: IContext = { current: '', store: {} }
        try {
          const newContext = addContext(context, contextName, specFile)
          save(updateCurrent(newContext, contextName))
          console.log(successMessage(contextName))
        } catch (error) {
          throw error
        }
      }
      throw error
    }
  }
}
