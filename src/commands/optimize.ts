import {Flags} from '@oclif/core';
import Command from '../base';
import * as optimizer from '@asyncapi/optimizer';

import { load } from '../models/SpecificationFile';

export default class Optimize extends Command {
  static description = 'starts a new local instance of Studio';

  static flags = {
    help: Flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    const { args,flags } = await this.parse(Optimize);
  }
}
