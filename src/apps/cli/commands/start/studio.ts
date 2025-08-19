import Command from '@cli/internal/base';
import { start as startStudio } from '@models/Studio';
import { load } from '@models/SpecificationFile';
import { studioFlags } from '@cli/internal/flags/start/studio.flags';
import { Args } from '@oclif/core';
import { isCancel, text, cancel } from '@clack/prompts';

export default class StartStudio extends Command {
  static description = 'starts a new local instance of Studio';

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

    let port = flags.port;

    if (flags.file) {
      this.warn(
        'The file flag has been removed and is being replaced by the argument spec-file. Please pass the filename directly like `asyncapi start studio asyncapi.yml`',
      );
    }

    const isInteractive = !flags['no-interactive'];

    if (isInteractive && !filePath) {
      const parsedArgs = await this.parseArgs({ filePath }, port?.toString());
      filePath = parsedArgs.filePath;
      port = parseInt(parsedArgs.port, 10);
    }

    if (!filePath) {
      try {
        filePath = (await load()).getFilePath();
        this.log(`Loaded specification from: ${filePath}`);
      } catch (error) {
        filePath = '';
        this.error('No file specified.');
      }
    }
    try {
      this.specFile = await load(filePath);
    } catch (error) {
      if (filePath) {
        this.error(error as Error);
      }
    }
    this.metricsMetadata.port = port;
    startStudio(filePath as string, port,flags.noBrowser);
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
