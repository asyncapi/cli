import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { load } from '@models/SpecificationFile';
import { specWatcher } from '@cli/internal/globals';
import { validateFlags } from '@cli/internal/flags/validate.flags';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { applyProxyConfiguration, extractProxyConfig } from '@/utils/proxy';
import {
  ServiceResult,
  ValidationOptions,
  ValidationResult,
} from '@/interfaces';
import {
  ValidationService,
  ValidationStatus,
} from '@services/validation.service';

export default class Validate extends Command {
  static description = 'validate asyncapi file';
  private validationService = new ValidationService();

  static flags = {
    ...validateFlags(),
    ...proxyFlags(), // Merge proxyFlags with validateFlags
  };

  static args = {
    'spec-file': Args.string({
      description: 'spec path, url, or context-name',
      required: false,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Validate); //NOSONAR
    const filePath = args['spec-file'];
    const proxyConfig = extractProxyConfig(flags);
    const filePathWithProxy = applyProxyConfiguration(filePath, proxyConfig.proxyHost, proxyConfig.proxyPort);

    this.specFile = await load(filePathWithProxy);
    const watchMode = flags.watch;

    if (watchMode) {
      specWatcher({
        spec: this.specFile,
        handler: this,
        handlerName: 'validate',
      });
    }

    // Prepare validate options
    const validateOptions: ValidationOptions = {
      ...flags,
      suppressWarnings: flags['suppressWarnings'],
      suppressAllWarnings: flags['suppressAllWarnings'],
    };

    const result = await this.validationService.validateDocument(
      this.specFile,
      validateOptions,
    );

    if (!result.success) {
      this.error(result.error || 'Validation failed', { exit: 1 });
    }

    this.metricsMetadata.validation_result = result;

    if (flags['score']) {
      this.log(`The score of the asyncapi document is ${result.data?.score}`);
    }

    if (flags['log-diagnostics']) {
      await this.handleDiagnostics(result, flags);
    }

    if (result.data?.status === ValidationStatus.INVALID) {
      process.exitCode = 1;
    }
  }

  private async handleDiagnostics(
    result: ServiceResult<ValidationResult>,
    flags: Record<string, unknown>,
  ): Promise<void> {
    const diagnosticsFormat = flags['diagnostics-format'] ?? 'stylish';
    const writeOutput = flags['save-output'];
    const hasIssues =
      (result.data?.diagnostics && result.data.diagnostics.length > 0) ?? false;
    const isFailSeverity = result.data?.status === ValidationStatus.INVALID;
    const sourceString = this.specFile?.toSourceString() || '';

    const governanceMessage = this.validationService.generateGovernanceMessage(
      sourceString,
      hasIssues,
      isFailSeverity,
    );

    if (isFailSeverity) {
      this.logToStderr(governanceMessage);
    } else {
      this.log(governanceMessage);
    }

    const diagnosticsOutput = this.validationService.formatDiagnosticsOutput(
      result.data?.diagnostics || [],
      diagnosticsFormat,
      flags['fail-severity'] ?? 'error',
    );

    if (writeOutput) {
      const { success, error } =
        await this.validationService.saveDiagnosticsToFile(
          writeOutput,
          diagnosticsFormat,
          diagnosticsOutput,
        );

      if (!success) {
        this.logToStderr(error || 'Failed to save diagnostics to file', {
          exit: 1,
        });
      } else {
        this.log(`Diagnostics saved to ${writeOutput}`);
      }
    } else {
      this.log(diagnosticsOutput);
    }
  }
}
