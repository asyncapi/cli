import {Flags} from '@oclif/core';
import Command from '../../base';
import { start as startStudio } from '../../models/Studio';
import { load } from '../../models/SpecificationFile';

export default class StartStudio extends Command {
  static description = 'starts a new local instance of Studio';

  static flags = {
    help: Flags.help({ char: 'h' }),
    file: Flags.string({ char: 'f', description: 'path to the AsyncAPI file to link with Studio' }),
    port: Flags.integer({ char: 'p', description: 'port in which to start Studio' }),
  }

  static args = []

  async run() {
    const { flags } = await this.parse(StartStudio);
    const filePath = flags.file || (await load()).getFilePath();
    const port = flags.port;

    startStudio(filePath as string, port);
  }
}
