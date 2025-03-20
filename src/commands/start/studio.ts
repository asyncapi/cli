import Command from '../../core/base';
import fs from 'fs';
import { start as startStudio } from '../../core/models/Studio';
import { load } from '../../core/models/SpecificationFile';
import { studioFlags } from '../../core/flags/start/studio.flags';
import { Args } from '@oclif/core';
import { isCancel, confirm, text } from '@clack/prompts';

export default class StartStudio extends Command {
  static description = 'starts a new local instance of Studio';

  static flags = studioFlags();

  static readonly args = {
    'spec-file': Args.string({ description: 'spec path, url, or context-name', required: false }),
  };

  async run() {
    const { args, flags } = await this.parse(StartStudio);
    const cancellationMessage = 'Operation cancelled';

    if (flags.file) {
      this.warn('The file flag has been removed and is being replaced by the argument spec-file. Please pass the filename directly like `asyncapi start studio asyncapi.yml`');
    }
    const filePath = await this.getSpecFile(args['spec-file'] ?? flags.file, cancellationMessage);
    try {
      this.specFile = await load(filePath as string | undefined);
    } catch (error) {
      if (filePath) {
        this.error(error as Error);
      }
    }
    
    const port = await this.getPort(flags.port, cancellationMessage);  
    this.metricsMetadata.port = port;
    startStudio(filePath as string, port);
  }

  private async getSpecFile(filePath: string | undefined, cancellationMessage: string) {
    if (filePath) return filePath;
    
    const response = await confirm({ message: 'Do you want to start AsyncAPI Studio with any reference? [y/n]' });
    if (isCancel(response)) {
      this.error(cancellationMessage, { exit: 1 });
    }
    if (!response) {
      try {
        const filePath = (await load()).getFilePath();
        this.log(`Loaded specification from: ${filePath}`);
        return filePath;
      } catch (error) {
        this.error('No file specified.');
      }
    }
    const asyncapi = await text({
      message: 'Please provide the path to the AsyncAPI document',
      placeholder: 'asyncapi.yaml',
      defaultValue: 'asyncapi.yaml',
      validate: (value) => {
        if (!value) return 'The path to the AsyncAPI document is required';
        if (!fs.existsSync(value)) return 'The file does not exist';
      }
    });
    
    if (isCancel(asyncapi)) {
      this.error(cancellationMessage, { exit: 1 });
    }
    return asyncapi;
  }
  
  private async getPort(port: number | undefined, cancellationMessage: string) {
    if (port) return port;
    
    const portInput = await text({
      message: 'Which port do you want to start AsyncAPI Studio on',
      placeholder: '3210',
      defaultValue: '3210',
      validate: (value) => (!value ? 'The port number is required' : undefined),
    });

    if (isCancel(portInput)) {
      this.error(cancellationMessage, { exit: 1 });
    }
    return Number.parseInt(portInput);
  }
}
