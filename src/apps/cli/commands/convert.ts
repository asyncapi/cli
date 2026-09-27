import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { ValidationError } from '@errors/validation-error';
import { load } from '@models/SpecificationFile';
import { SpecificationFileNotFound } from '@errors/specification-file';
import type { AsyncAPIConvertVersion } from '@asyncapi/converter';
import { cyan } from 'picocolors';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import specs from '@asyncapi/specs';
import { convertFlags } from '@cli/internal/flags/convert.flags';
import { ConversionService } from '@services/convert.service';
import { applyProxyToPath } from '@utils/proxy';
import { existsSync } from 'fs';
import path from 'path';
import { Specification } from '@models/SpecificationFile';

const latestVersion = Object.keys(specs.schemas).pop() as string;
const TARGET_VERSION_FLAG = 'target-version';

export default class Convert extends Command {
  static description =
    'Convert asyncapi documents older to newer versions or OpenAPI documents to AsyncAPI';
  private conversionService = new ConversionService();
  static flags = {
    ...convertFlags(latestVersion),
    ...proxyFlags(),
  };

  static args = {
    'spec-file': Args.string({
      description: 'spec path, url, or context-name',
      required: false,
    }),
  };

  async run(): Promise<unknown> {
    const { args, flags } = await this.parse(Convert);
    const filePath = applyProxyToPath(
      args['spec-file'],
      flags['proxyHost'],
      flags['proxyPort']
    );
    const targetVersion = flags[TARGET_VERSION_FLAG];

    try {
      // LOAD FILE
      this.specFile = await load(filePath);
      this.metricsMetadata.to_version = targetVersion;
      const conversionOptions = {
        format: flags.format as 'asyncapi' | 'openapi',
        [TARGET_VERSION_FLAG]: (targetVersion ||
          latestVersion) as AsyncAPIConvertVersion,
        perspective: flags['perspective'] as 'client' | 'server',
      };

      const result = await this.conversionService.convertDocument(
        this.specFile,
        conversionOptions,
      );

      if (!result.success || !result.data) {
        this.error(result.error || 'Conversion failed', { exit: 1 });
      }

      this.metricsMetadata.conversion_result = result;

      this.log(
        this.conversionService.handleLogging(this.specFile, conversionOptions),
      );

      const outputPath = flags.output
        ? path.resolve(process.cwd(), flags.output)
        : null;
      const overwritten = outputPath ? existsSync(outputPath) : false;
      if (flags['output']) {
        await this.conversionService.handleOutput(
          flags['output'],
          result.data.convertedDocument,
        );
      } else {
        this.log(result.data.convertedDocument);
      }

      const sourceDocument = this.specFile.toJson();
      return this.result('The document was converted successfully.', {
        source: sourceData(args['spec-file'], this.specFile),
        sourceFormat: conversionOptions.format,
        sourceVersion: sourceDocument.asyncapi ?? sourceDocument.openapi ?? null,
        targetFormat: 'asyncapi' as const,
        targetVersion: conversionOptions[TARGET_VERSION_FLAG],
        perspective: conversionOptions.perspective,
        document: outputPath
          ? null
          : new Specification(result.data.convertedDocument).toJson(),
        output: outputPath
          ? {
            path: outputPath,
            format: path.extname(outputPath).slice(1) || 'yaml',
            overwritten,
          }
          : null,
        warnings: [],
      });
    } catch (err) {
      throw this.handleError(err, filePath ?? 'unknown', targetVersion);
    }
  }

  // Helper function to handle errors
  private handleError(err: unknown, filePath: string, targetVersion: string | undefined): never {
    if (err instanceof SpecificationFileNotFound) {
      this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: filePath,
        }),
      );
    } else if (this.specFile?.toJson().asyncapi > (targetVersion ?? '')) {
      this.error(
        `The ${cyan(filePath)} file cannot be converted to an older version. Downgrading is not supported.`,
      );
    } else {
      this.error(err as Error);
    }
  }
}

function sourceData(input: string | undefined, specification: Specification) {
  const source = specification.getFileURL() ?? specification.getFilePath() ?? input ?? '';
  const resolved = specification.getFileURL() ?? path.resolve(source);
  let kind = 'context';
  if (specification.getFileURL()) {
    kind = 'url';
  } else if (!input) {
    kind = 'auto-detected';
  } else if (path.resolve(input) === resolved) {
    kind = 'file';
  }
  return { input: input ?? source, kind, resolved };
}
