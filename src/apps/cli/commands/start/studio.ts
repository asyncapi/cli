import Command from '@cli/internal/base';
import { start as startStudio } from '@models/Studio';
import { ensureStudio } from '@models/studio-installer';
import { load } from '@models/SpecificationFile';
import { studioFlags } from '@cli/internal/flags/start/studio.flags';
import { Args } from '@oclif/core';
import { isCancel, text, cancel } from '@clack/prompts';
import path from 'path';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';
import { parsePortFlag } from '@utils/port';

export default class StartStudio extends Command {
  static readonly description = 'starts a new local instance of Studio. Studio (~450MB) is installed on-demand on first use; pass --yes to install without prompting.';

  static flags = studioFlags();

  static readonly args = {
    'spec-file': Args.string({
      description: 'spec path, url, or context-name',
      required: false,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(StartStudio);

    let filePath = args['spec-file'] ?? flags.file;

    let port = parsePortFlag(flags.port);

    const json = this.jsonEnabled();

    if (flags.file && !json) {
      this.warn(
        'The file flag has been removed and is being replaced by the argument spec-file. Please pass the filename directly like `asyncapi start studio asyncapi.yml`',
      );
    }

    const isInteractive = !flags['no-interactive'] && !json;

    if (isInteractive && !filePath) {
      const parsedArgs = await this.parseArgs({ filePath }, port?.toString());
      filePath = parsedArgs.filePath;
      port = parsePortFlag(parsedArgs.port);
    }

    if (!filePath) {
      try {
        filePath = (await load()).getFilePath();
        if (!json) {
          this.log(`Loaded specification from: ${filePath}`);
        }
      } catch (error) {
        // Preserve the historical `Error:` prefix of oclif's string errors.
        throw Object.assign(
          new ApplicationError(
            CLI_ERROR_CODES.CLI_INPUT_REQUIRED,
            'No file specified.',
            { cause: error },
          ),
          { name: 'Error' },
        );
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
    this.metricsMetadata.port = port;
    const studioPath = await ensureStudio(this.config, {
      yes: flags.yes,
      noInteractive: flags['no-interactive'] || json,
      quiet: json,
    });
    const { host, port: actualPort, url } = await startStudio(
      filePath as string,
      port,
      flags.noBrowser || json,
      studioPath,
      json,
    );

    if (json) {
      this.emitStructuredOutput(this.result('Server started.', {
        event: 'server.started',
        source: {
          input: args['spec-file'] ?? flags.file ?? filePath,
          kind: this.specFile?.getFileURL() ? 'url' : 'file',
          resolved: this.specFile?.getFileURL() ?? path.resolve(filePath as string),
        },
        host,
        port: actualPort,
        url,
        pid: process.pid,
        editable: true,
        warnings: [],
      }));
    }
  }

  private async parseArgs(args: Record<string, any>, port?: string) {
    const operationCancelled = 'Operation cancelled by the user.';
    let askForPort = false;
    let { filePath } = args;
    if (!filePath) {
      filePath = await text({
        message: 'Enter the path to the AsyncAPI document',
        defaultValue: 'asyncapi.yaml',
        placeholder: 'asyncapi.yaml',
        validate: (value) => {
          if (!value) {
            return 'The path to the AsyncAPI document is required';
          }
        },
      });
      askForPort = true;
    }

    if (isCancel(filePath)) {
      cancel(operationCancelled);
      this.exit();
    }

    if (!port && askForPort) {
      port = (await text({
        message: 'Enter the port in which to start Studio',
        defaultValue: '3210',
        placeholder: '3210',
        validate: (value) =>
          !value ? 'The port number is required' : undefined,
      })) as string;
    }

    if (isCancel(port)) {
      cancel(operationCancelled);
      this.exit();
    }

    return { filePath, port: port ?? '3210' };
  }
}
