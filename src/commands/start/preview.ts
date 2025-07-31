import { Args } from '@oclif/core';
import Command from '../../core/base';
import { previewFlags } from '../../core/flags/start/preview.flags';
import { load } from '../../core/models/SpecificationFile';
import { startPreview } from '../../core/models/Preview';

export default class PreviewStudio extends Command {
  static readonly description = 'starts a new local instance of Studio in minimal state bundling all the refs of the schema file and with no editing allowed.';

  static readonly flags = previewFlags();

  static readonly args = {
    'spec-file': Args.string({ description: 'the path to the file to be opened with studio or context name', required: true }),
  };

  async run () {
    const {args,flags} = await this.parse(PreviewStudio);
    
    let filePath : string | undefined = args['spec-file'] ?? flags.file;
    
    const previewPort = flags.port;

    if (!filePath) {
      filePath = ((await load()).getFilePath());
      this.log(`Loaded the specification from: ${filePath}`);
    }
    try {
      this.specFile = await load(filePath);
    } catch (error) {
      if (filePath) {
        this.error(error as Error);
      }
    }
    this.metricsMetadata.port = previewPort;
    startPreview(filePath as string,flags.base,flags.baseDir,flags.xOrigin,flags.suppressLogs,previewPort,flags.noBrowser);
  }
}
