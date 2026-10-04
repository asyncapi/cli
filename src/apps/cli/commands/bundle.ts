import Command from '@cli/internal/base';
import bundle from '@asyncapi/bundler';
import { existsSync, promises } from 'node:fs';
import path from 'node:path';
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
    const inputs = argv as string[];
    const output = flags.output;
    validateBundleInputs(inputs, output);

    const resolvedOutput = output ? path.resolve(process.cwd(), output) : null;
    const overwritten = resolvedOutput ? existsSync(resolvedOutput) : false;
    this.metricsMetadata.files = inputs.length;

    const document = await runBundler(inputs, flags);
    await this.collectMetricsData(document);

    // Printed output follows the first input's extension; written output follows the target's.
    const format = output ? bundleFormat(output) : printFormat(inputs[0]);
    if (resolvedOutput) {
      await writeFile(resolvedOutput, serialize(document, format), { encoding: 'utf-8' });
      this.log(`Check out your shiny new bundled files at ${output}`);
    } else {
      this.log(format === 'yaml' ? document.yml() : JSON.stringify(document.json()));
    }

    return this.result('The AsyncAPI documents were bundled successfully.', {
      sources: inputs.map(describeBundleInput),
      document: resolvedOutput ? null : document.json(),
      format,
      output: resolvedOutput ? { path: resolvedOutput, format, overwritten } : null,
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

type BundleFormat = 'json' | 'yaml';

const isUrl = (input: string): boolean =>
  input.startsWith('http://') || input.startsWith('https://');

function validateBundleInputs(inputs: string[], output: string | undefined): void {
  if (inputs.length === 0) {
    throw new ApplicationError(
      CLI_ERROR_CODES.CLI_INPUT_REQUIRED,
      'At least one AsyncAPI document is required.',
    );
  }
  if (output && !['.json', '.yaml', '.yml'].includes(path.extname(output))) {
    throw new ApplicationError(
      CLI_ERROR_CODES.FILE_EXTENSION_UNSUPPORTED,
      'Bundle output must use a .json, .yaml, or .yml extension.',
      { details: { path: path.resolve(process.cwd(), output) } },
    );
  }
}

async function runBundler(
  inputs: string[],
  flags: { base?: string; baseDir?: string; xOrigin?: boolean },
): Promise<Document> {
  try {
    return await bundle(inputs, {
      base: flags.base,
      baseDir: flags.baseDir,
      xOrigin: flags.xOrigin,
    });
  } catch (error) {
    // Typed package errors (e.g. future BUNDLER_* codes) are mapped centrally.
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    throw new ApplicationError(
      CLI_ERROR_CODES.DEPENDENCY_ERROR,
      error instanceof Error ? error.message : 'Bundling failed.',
      { cause: error },
    );
  }
}

/** Output file format; the extension was already validated as .json/.yaml/.yml. */
function bundleFormat(fileName: string): BundleFormat {
  return path.extname(fileName) === '.json' ? 'json' : 'yaml';
}

/** Printed format: YAML only for YAML inputs, JSON for everything else. */
function printFormat(fileName: string): BundleFormat {
  return ['.yaml', '.yml'].includes(path.extname(fileName)) ? 'yaml' : 'json';
}

function serialize(document: Document, format: BundleFormat): string {
  return (format === 'yaml' ? document.yml() : document.string()) || '';
}

function describeBundleInput(input: string) {
  if (isUrl(input)) {
    return { input, kind: 'url', resolved: input };
  }
  return { input, kind: 'file', resolved: path.resolve(input) };
}
