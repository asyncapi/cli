import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { previewFlags } from '@cli/internal/flags/start/preview.flags';
import { load } from '@models/SpecificationFile';
import { startPreview } from '@models/Preview';

export default class PreviewStudio extends Command {
  static readonly description =
    'starts a new local instance of Studio in minimal state bundling all the refs of the schema file and with no editing allowed.';

  static readonly flags = previewFlags();

  static readonly args = {
    'spec-file': Args.string({
      description:
        'the path to the file to be opened with studio or context name',
      required: true,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(PreviewStudio);

    let filePath: string | undefined = args['spec-file'] ?? flags.file;

    const previewPort = parseInt(flags.port ?? '0',10);

    if (!filePath) {
      filePath = (await load()).getFilePath();
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
    startPreview(
      filePath as string,
      flags.base,
      flags.baseDir,
      flags.xOrigin,
      flags.suppressLogs,
      previewPort,
      flags.noBrowser
    );
  }
}
