import Command from '@cli/internal/base';
import bundle from '@asyncapi/bundler';
import { existsSync, promises } from 'fs';
import path from 'path';
import { Specification } from '@models/SpecificationFile';
import { Document } from '@asyncapi/bundler/lib/document';
import { bundleFlags } from '@cli/internal/flags/bundle.flags';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

const { writeFile } = promises;

export default class Bundle extends Command {
  static readonly description =
    'Bundle one or multiple AsyncAPI Documents and their references together.';
  static strict = false;

  static examples = [
    'asyncapi bundle ./asyncapi.yaml > final-asyncapi.yaml',
    'asyncapi bundle ./asyncapi.yaml --output final-asyncapi.yaml',
    'asyncapi bundle ./asyncapi.yaml ./features.yaml',
    'asyncapi bundle ./asyncapi.yaml ./features.yaml --base ./main.yaml',
    'asyncapi bundle ./asyncapi.yaml ./features.yaml --base ./main.yaml --xOrigin',
    'asyncapi bundle ./asyncapi.yaml -o final-asyncapi.yaml --base ../public-api/main.yaml --baseDir ./social-media/comments-service',
  ];

  static flags = bundleFlags();

  async run(): Promise<unknown> {
    const { argv, flags } = await this.parse(Bundle);
    if (argv.length === 0) {
      throw new ApplicationError(
        CLI_ERROR_CODES.CLI_INPUT_REQUIRED,
        'At least one AsyncAPI document is required.',
      );
    }
    const output = flags.output;
    const outputFormat = path.extname(argv[0] as string);
    const AsyncAPIFiles = argv as string[];
    const resolvedOutput = output ? path.resolve(process.cwd(), output) : null;
    const overwritten = resolvedOutput ? existsSync(resolvedOutput) : false;
    if (output && !['.json', '.yaml', '.yml'].includes(path.extname(output))) {
      throw new ApplicationError(
        CLI_ERROR_CODES.FILE_EXTENSION_UNSUPPORTED,
        'Bundle output must use a .json, .yaml, or .yml extension.',
        { details: { path: resolvedOutput } },
      );
    }

    this.metricsMetadata.files = AsyncAPIFiles.length;

    let document: Document;
    try {
      document = await bundle(AsyncAPIFiles, {
        base: flags.base,
        baseDir: flags.baseDir,
        xOrigin: flags.xOrigin,
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw new ApplicationError(
        CLI_ERROR_CODES.DEPENDENCY_ERROR,
        error instanceof Error ? error.message : 'Bundling failed.',
        { cause: error },
      );
    }

    await this.collectMetricsData(document);

    if (!output) {
      if (outputFormat === '.yaml' || outputFormat === '.yml') {
        this.log(document.yml());
      } else {
        this.log(JSON.stringify(document.json()));
      }
    } else {
      const format = path.extname(output);

      if (format === '.yml' || format === '.yaml') {
        await writeFile(
          resolvedOutput as string,
          document.yml() || '',
          {
            encoding: 'utf-8',
          },
        );
      }

      if (format === '.json') {
        await writeFile(
          resolvedOutput as string,
          document.string() || '',
          {
            encoding: 'utf-8',
          },
        );
      }
      this.log(`Check out your shiny new bundled files at ${output}`);
    }

    const format = (output ? path.extname(output) : outputFormat) === '.json'
      ? 'json'
      : 'yaml';
    return this.result('The AsyncAPI documents were bundled successfully.', {
      sources: AsyncAPIFiles.map((input) => ({
        input,
        kind: input.startsWith('http://') || input.startsWith('https://') ? 'url' : 'file',
        resolved: input.startsWith('http://') || input.startsWith('https://')
          ? input
          : path.resolve(input),
      })),
      document: output ? null : document.json(),
      format,
      output: resolvedOutput
        ? { path: resolvedOutput, format, overwritten }
        : null,
      warnings: [],
    });
  }

  private async collectMetricsData(document: Document) {
    try {
      // We collect the metadata from the final output so it contains all the files
      this.specFile = new Specification(document.string() ?? '');
    } catch (e: any) {
      if (e instanceof Error) {
        this.log(
          `Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`,
        );
      }
    }
  }
}
