import { flags } from '@oclif/command';
import Command from '../../base';
import { start as startStudio } from '../../models/Studio';
import { load } from '../../models/SpecificationFile';

export default class StartStudio extends Command {
  static description = 'starts a new local instance of Studio';

  static flags = {
    help: flags.help({ char: 'h' }),
    file: flags.string({ char: 'f', description: 'path to the AsyncAPI file to link with Studio' }),
    port: flags.integer({ char: 'p', description: 'port in which to start Studio' }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(StartStudio);
    const filePath = flags.file || (await load()).getFilePath();
    const port = flags.port;

    startStudio(filePath as string, port);
  }
}
