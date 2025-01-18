import Command from '../../core/base';
import { start as startStudio } from '../../core/models/Studio';
import { load } from '../../core/models/SpecificationFile';
import { studioFlags } from '../../core/flags/start/studio.flags';
import { Args } from '@oclif/core';
import { ValidationError } from '../../core/errors/validation-error';

export default class StartStudio extends Command {
  static description = 'starts a new local instance of Studio';

  static flags = studioFlags();

  static readonly args = {
    'spec-file': Args.string({
      description: 'spec path, url, or context-name',
      required: true,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(StartStudio);
    const filePath = args['spec-file'];
    const port = flags.port;

    try {
      this.specFile = await load(filePath);
    } catch (err) {
      this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: filePath,
        }),
      );
    }
    this.metricsMetadata.port = port;

    startStudio(filePath as string, port);
  }
}
