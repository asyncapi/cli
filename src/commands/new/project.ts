//import glee from './glee';
//export default glee;

import NewGlee from './glee'

export default class NewProject extends NewGlee {
  constructor(...args: string[]) {
    super(..args)
    this.commandName = 'project'
  }
}