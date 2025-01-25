import Command from '../../core/base';
import { start as startStudio } from '../../core/models/Studio';
import { load } from '../../core/models/SpecificationFile';
import bundle from '@asyncapi/bundler';
import path from 'path';
import fs from 'fs';
import { Args } from '@oclif/core';
import chokidar from 'chokidar';
import { previewFlags } from '../../core/flags/start/preview.flags';
import * as yaml from 'js-yaml';
import { NO_CONTEXTS_SAVED } from '../../core/errors/context-error';

interface LocalRef {
    filePath: string;
    pointer: string | null;
}

class StartPreview extends Command {
  static description =
    'Starts Studio in preview mode with local reference files bundled and hot reloading enabled.';

  static examples = [
    'asyncapi start preview',
    'asyncapi start preview ./asyncapi.yaml',
    'asyncapi start preview CONTEXT_NAME'
  ];

  static flags = previewFlags();

  static args = {
    'spec-file': Args.string({
      description: 'spec path, url, or context-name',
      required: false,
    }),
  };

  parseRef(ref: string): LocalRef {
    const [filePath, pointer] = ref.split('#');
    return {
      filePath: filePath || '',
      pointer: pointer || null,
    };
  }

  findLocalRefFiles(obj: any, basePath: string, files: Set<string>): void {
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (
          key === '$ref' &&
                    typeof value === 'string' &&
                    (value.startsWith('.') || value.startsWith('./') || value.startsWith('../'))
        ) {
          const { filePath } = this.parseRef(value);
          const resolvedPath = path.resolve(basePath, filePath);

          if (fs.existsSync(resolvedPath)) {
            files.add(resolvedPath);
            const referencedFile = yaml.load(
              fs.readFileSync(resolvedPath, 'utf8')
            );
            this.findLocalRefFiles(referencedFile, path.dirname(resolvedPath), files);
          } else {
            this.error(`Missing local reference: ${value}`);
          }
        } else {
          this.findLocalRefFiles(value, basePath, files);
        }
      }
    } else if (Array.isArray(obj)) {
      for (const item of obj) {
        this.findLocalRefFiles(item, basePath, files);
      }
    }
  }

  async updateBundledFile(
    AsyncAPIFile: string,
    outputFormat: string,
    bundledFilePath: string
  ) {
    try {
      const document = await bundle(AsyncAPIFile);
      const fileContent =
                outputFormat === '.yaml' || outputFormat === '.yml'
                  ? document.yml()
                  : JSON.stringify(document.json());
      fs.writeFileSync(bundledFilePath, fileContent, { encoding: 'utf-8' });
    } catch (error: any) {
      throw new Error(`Error bundling files: ${error.message}`);
    }
  }

  async run() {
    const { args, flags } = await this.parse(StartPreview);
    const port = flags.port;
    const filePath = args['spec-file'];

    this.specFile = await load(filePath);
    this.metricsMetadata.port = port;

    const AsyncAPIFile = this.specFile.getFilePath();

    if (!AsyncAPIFile) {
      this.error(NO_CONTEXTS_SAVED);
    }

    const outputFormat = path.extname(AsyncAPIFile);
    if (!outputFormat) {
      this.error(
        'Unable to determine file format from the provided AsyncAPI file.'
      );
    }

    const bundledFilePath = `./asyncapi-bundled${outputFormat}`;
    const basePath = path.dirname(path.resolve(AsyncAPIFile));
    const filesToWatch = new Set<string>();

    filesToWatch.add(this.specFile.getFilePath()!);
    const asyncapiDocument = yaml.load(
      fs.readFileSync(this.specFile.getFilePath()!, 'utf8')
    );
    this.findLocalRefFiles(asyncapiDocument, basePath, filesToWatch);

    const watcher = chokidar.watch(Array.from(filesToWatch), {
      persistent: true,
    });

    await this.updateBundledFile(
      AsyncAPIFile,
      outputFormat,
      bundledFilePath
    );

    watcher.on('change', async (changedPath) => {
      this.log(`File changed: ${changedPath}`);
      try {
        await this.updateBundledFile(
          AsyncAPIFile,
          outputFormat,
          bundledFilePath
        );
      } catch (error: any) {
        this.error(`Error updating bundled file: ${error.message}`);
      }
    });

    startStudio(bundledFilePath, port);
  }
}

export default StartPreview;
