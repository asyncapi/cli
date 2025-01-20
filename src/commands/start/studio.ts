import Command from '../../core/base';
import { start as startStudio } from '../../core/models/Studio';
import { load } from '../../core/models/SpecificationFile';
import { studioFlags } from '../../core/flags/start/studio.flags';
import { Args } from '@oclif/core';

export default class StartStudio extends Command {
  static description = 'starts a new local instance of Studio';

  static flags = studioFlags();

  static readonly args = {
    'spec-file': Args.string({ description: 'spec path, url, or context-name', required: false }),
  };

  async run() {
    const { args, flags } = await this.parse(StartStudio);
    let filePath = args['spec-file'];
    const port = flags.port;
    if (!filePath) {
      try {
        filePath = ((await load()).getFilePath());
        this.log(`Loaded specification from: ${filePath}`);
      } catch (error) {
        filePath = "";
        this.log('No file specified.');
      }
    }
    try {
      this.specFile = await load(filePath);
    } catch (error) {
      if(filePath){
        this.error(error as Error);
      }
    }
    this.metricsMetadata.port = port;
    startStudio(filePath as string, port);
  }
}
