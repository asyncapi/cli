import { Args } from '@oclif/core';
import Command from '../../core/base';
import { previewFlags } from '../../core/flags/start/preview.flags';
import { load } from '../../core/models/SpecificationFile';
import { startPreview } from '../../core/models/Preview';

export default class PreviewStudio extends Command {
  static readonly description = 'starts a new local instance of AsyncAPI studio in readOnly state with minimal UI and no editing';

  static readonly flags = previewFlags();

  static readonly args = {
    'spec-file': Args.string({ description: 'spec path, url, or context-name', required: false }),
  };

  async run () {
    const {args,flags} = await this.parse(PreviewStudio);

    if (flags.file) {
      this.warn('The file flag has been removed and is being replaced by the argument spec-file. Please pass the filename directly like `asyncapi start studio asyncapi.yml`');
    }
    
    let filePath : string | undefined = args['spec-file'] ?? flags.file;
    
    const previewPort = flags.port;

    if (!filePath) {
      try {
        filePath = ((await load()).getFilePath());
        this.log(`Loaded the specification from: ${filePath}`);
      } catch (error) {
        filePath = '';
        this.error('No file specified in the arguments. Please specify a file path.');
      }
    }
    try {
      this.specFile = await load(filePath);
    } catch (error) {
      if (filePath) {
        this.error(error as Error);
      }
    }
    this.metricsMetadata.port = previewPort;
    startPreview(filePath as string,previewPort);
  }
}
