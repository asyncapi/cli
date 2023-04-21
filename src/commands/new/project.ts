import { Config } from '@oclif/core';
import NewGlee from './glee';

export default class NewProject extends NewGlee {
  constructor(argv: string[], config: Config) {
    super(argv, config);
    this.commandName = 'project';
  }
}
