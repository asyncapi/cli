import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { describeSource } from '@cli/internal/output/source';
import { load, Specification } from '@models/SpecificationFile';
import {
  ErrorLoadingSpec,
  SpecificationFileNotFound,
  SpecificationURLNotFound,
  SpecificationWrongFileFormat,
} from '@errors/specification-file';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES, type CliErrorCode } from '@errors/error-codes';
import type { AsyncAPIConvertVersion } from '@asyncapi/converter';
import { cyan } from 'picocolors';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import specs from '@asyncapi/specs';
import { convertFlags } from '@cli/internal/flags/convert.flags';
import { ConversionService } from '@services/convert.service';
import { applyProxyToPath } from '@utils/proxy';
import { existsSync } from 'node:fs';
import path from 'node:path';

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
        const message = result.error || 'Conversion failed';
        // Preserve the historical `Error:` prefix of oclif's string errors.
        throw Object.assign(
          new ApplicationError(conversionFailureCode(message), message),
          { name: 'Error' },
        );
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
        source: describeSource(args['spec-file'], this.specFile),
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
    // Typed errors are already classified by the central error mapper.
    if (isTypedDomainError(err)) {
      throw err;
    }
    if (this.specFile?.toJson().asyncapi > (targetVersion ?? '')) {
      throw Object.assign(
        new ApplicationError(
          CLI_ERROR_CODES.CONVERSION_DOWNGRADE_UNSUPPORTED,
          `The ${cyan(filePath)} file cannot be converted to an older version. Downgrading is not supported.`,
          { cause: err },
        ),
        { name: 'Error' },
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    throw Object.assign(
      new ApplicationError(conversionFailureCode(message), message, { cause: err }),
      { name: err instanceof Error ? err.name : 'Error' },
    );
  }
}

function conversionFailureCode(message: string): CliErrorCode {
  if ((/downgrad|older version/i).test(message)) {
    return CLI_ERROR_CODES.CONVERSION_DOWNGRADE_UNSUPPORTED;
  }
  if ((/same version/i).test(message)) {
    return CLI_ERROR_CODES.DOCUMENT_ALREADY_IN_TARGET_FORMAT;
  }
  if ((/cannot convert from|not able to convert|unsupported|not supported/i).test(message)) {
    return CLI_ERROR_CODES.DOCUMENT_VERSION_UNSUPPORTED;
  }
  return CLI_ERROR_CODES.DEPENDENCY_ERROR;
}

function isTypedDomainError(err: unknown): boolean {
  if (
    err instanceof ApplicationError ||
    err instanceof ErrorLoadingSpec ||
    err instanceof SpecificationFileNotFound ||
    err instanceof SpecificationURLNotFound ||
    err instanceof SpecificationWrongFileFormat
  ) {
    return true;
  }
  if (!(err instanceof Error)) {
    return false;
  }
  // Context errors and Node.js system errors (e.g. ENOENT on --output) are
  // recognized by the central error mapper.
  return err.name === 'ContextError' || typeof (err as { code?: unknown }).code === 'string';
}
