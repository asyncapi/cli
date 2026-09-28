import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { previewFlags } from '@cli/internal/flags/start/preview.flags';
import { load } from '@models/SpecificationFile';
import { startPreview } from '@models/Preview';
import { ensureStudio } from '@models/studio-installer';
import path from 'path';
import { parsePortFlag } from '@utils/port';

export default class PreviewStudio extends Command {
  static readonly description =
    'starts a new local instance of Studio in minimal state bundling all the refs of the schema file and with no editing allowed. Studio (~450MB) is installed on-demand on first use; pass --yes to install without prompting.';

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

    const previewPort = parsePortFlag(flags.port);
    const json = this.jsonEnabled();

    if (!filePath) {
      filePath = (await load()).getFilePath();
      if (!json) {
        this.log(`Loaded the specification from: ${filePath}`);
      }
    }
    try {
      this.specFile = await load(filePath);
    } catch (error) {
      if (filePath) {
        // load() throws typed errors that the central error mapper classifies.
        throw error;
      }
    }
    this.metricsMetadata.port = previewPort;
    const studioPath = await ensureStudio(this.config, {
      yes: flags.yes,
      noInteractive: json,
      quiet: json,
    });
    const { host, port, url, watchedFiles } = await startPreview(filePath as string, {
      base: flags.base,
      baseDirectory: flags.baseDir,
      xOrigin: flags.xOrigin,
      suppressLogs: flags.suppressLogs,
      port: previewPort,
      noBrowser: flags.noBrowser || json,
      studioPath,
      quiet: json,
    });

    if (json) {
      this.emitStructuredOutput(this.result('Server started.', {
        event: 'server.started',
        source: {
          input: args['spec-file'],
          kind: this.specFile?.getFileURL() ? 'url' : 'file',
          resolved: this.specFile?.getFileURL() ?? path.resolve(filePath as string),
        },
        host,
        port,
        url,
        pid: process.pid,
        editable: false,
        watchedFiles,
        warnings: [],
      }));
    }
  }
}
