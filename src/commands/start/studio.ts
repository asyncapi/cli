import Command from '../../core/base';
import { start as startStudio } from '../../core/models/Studio';
import { load } from '../../core/models/SpecificationFile';
import { studioFlags } from '../../core/flags/start/studio.flags';
import { Args } from '@oclif/core';

export default class StartStudio extends Command {
  static description = 'starts a new local instance of Studio';

  static flags = studioFlags();

  static readonly args = {
    'spec-file': Args.string({description: 'spec path, url, or context-name', required: false}),
  };

  async run() {
    const { args, flags } = await this.parse(StartStudio);
    const filePath = args['spec-file'] || (await load()).getFilePath();
    const port = flags.port;

    if (!args['spec-file']) {
      this.log('\nTo open a specific AsyncAPI file in the Studio, use: asyncapi start studio [your-spec-file-location]\n\n');
    }
    
    this.specFile = await load(filePath);
    this.metricsMetadata.port = port;

    startStudio(filePath as string, port);
  }
}
