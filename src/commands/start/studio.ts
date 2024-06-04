import Command from '../../core/base';
import { start as startStudio } from '../../core/models/Studio';
import { load } from '../../core/models/SpecificationFile';
import { studioFlags } from 'core/flags/start/studio.flags';

export default class StartStudio extends Command {
  static description = 'starts a new local instance of Studio';

  static flags = studioFlags();

  async run() {
    const { flags } = await this.parse(StartStudio);
    const filePath = flags.file || (await load()).getFilePath();
    const port = flags.port;
    
    this.specFile = await load(filePath);
    this.metricsMetadata.port = port;

    startStudio(filePath as string, port);
  }
}
