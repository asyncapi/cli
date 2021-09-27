import {Command, flags} from '@oclif/command'
import { parse } from '@asyncapi/parser'
import { SpecificationFile } from '../models/SpecificationFile'

export default class Validate extends Command {
  static description = 'validates an AsyncAPI file'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args} = this.parse(Validate)

    const file = new SpecificationFile(args.file || 'asyncapi.yaml')
    
    try {
      await parse(file.read())
      console.log(`File: ${args.file} successfully validated!`)
    } catch (err) {
      console.error(err)
    }
  }
}
