import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { ValidationError } from '@errors/validation-error';
import { load } from '@models/SpecificationFile';
import { SpecificationFileNotFound } from '@errors/specification-file';
import type { AsyncAPIConvertVersion } from '@asyncapi/converter';
import { cyan } from 'picocolors';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { applyProxyConfiguration, extractProxyConfig } from '@/utils/proxy';
import specs from '@asyncapi/specs';
import { convertFlags } from '@cli/internal/flags/convert.flags';
import { ConversionService } from '@services/convert.service';

const latestVersion = Object.keys(specs.schemas).pop() as string;

export default class Convert extends Command {
  static specFile: any;
  static metricsMetadata: any = {};
  static description =
    'Convert asyncapi documents older to newer versions or OpenAPI/postman-collection documents to AsyncAPI';
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

  async run() {
    const { args, flags } = await this.parse(Convert);
    const filePath = args['spec-file'];
    const proxyConfig = extractProxyConfig(flags);
    const filePathWithProxy = applyProxyConfiguration(filePath, proxyConfig.proxyHost, proxyConfig.proxyPort);

    try {
      // LOAD FILE
      this.specFile = await load(filePathWithProxy);
      // eslint-disable-next-line sonarjs/no-duplicate-string
      this.metricsMetadata.to_version = flags['target-version'];
      const conversionOptions = {
        format: flags.format as 'asyncapi' | 'openapi' | 'postman-collection',
        'target-version': (flags['target-version'] ||
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

      if (flags['output']) {
        await this.conversionService.handleOutput(
          flags['output'],
          result.data.convertedDocument,
        );
      } else {
        this.log(result.data.convertedDocument);
      }
    } catch (err) {
      this.handleError(err, filePath ?? 'unknown', flags);
    }
  }

  // Helper function to handle errors
  private handleError(err: unknown, filePath: string, flags: Record<string, unknown>) {
    if (err instanceof SpecificationFileNotFound) {
      this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: filePath,
        }),
      );
    } else if (this.specFile?.toJson().asyncapi > flags['target-version']) {
      this.error(
        `The ${cyan(filePath)} file cannot be converted to an older version. Downgrading is not supported.`,
      );
    } else {
      this.error(err as Error);
    }
  }
}
