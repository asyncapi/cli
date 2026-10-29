import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { load } from '@models/SpecificationFile';
import { specWatcher } from '@cli/internal/globals';
import { validateFlags } from '@cli/internal/flags/validate.flags';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import {
  ServiceResult,
  ValidationOptions,
  ValidationResult,
} from '@/interfaces';
import type { ValidationService, } from '@services/validation.service';
import { applyProxyToPath } from '@utils/proxy';

export default class Validate extends Command {
  static description = 'validate asyncapi file';
  private _validationService?: ValidationService;

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
    const filePath = applyProxyToPath(
      args['spec-file'],
      flags['proxyHost'],
      flags['proxyPort']
    );

    this.specFile = await load(filePath);
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

    const vService = await this.getValidationService();
    const result = await vService.validateDocument(
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

    const { ValidationStatus } = await import('@services/validation.service');
    if (result.data?.status === ValidationStatus.INVALID) {
      process.exitCode = 1;
    }
  }

  private async getValidationService(): Promise<ValidationService> {
    if (!this._validationService) {
      const { ValidationService: vService } = await import('@services/validation.service');
      this._validationService = new vService();
    }

    return this._validationService;
  }

  private async handleDiagnostics(
    result: ServiceResult<ValidationResult>,
    flags: any,
  ): Promise<void> {
    const diagnosticsFormat = flags['diagnostics-format'] ?? 'stylish';
    const writeOutput = flags['save-output'];
    const hasIssues =
      (result.data?.diagnostics && result.data.diagnostics.length > 0) ?? false;
    const { ValidationStatus } = await import('@services/validation.service');
    const isFailSeverity = result.data?.status === ValidationStatus.INVALID;
    const sourceString = this.specFile?.toSourceString() || '';

    const vService = await this.getValidationService();
    const governanceMessage = vService.generateGovernanceMessage(
      sourceString,
      hasIssues,
      isFailSeverity,
    );

    if (isFailSeverity) {
      this.logToStderr(governanceMessage);
    } else {
      this.log(governanceMessage);
    }

    const diagnosticsOutput = vService.formatDiagnosticsOutput(
      result.data?.diagnostics || [],
      diagnosticsFormat,
      flags['fail-severity'] ?? 'error',
    );

    if (writeOutput) {
      const { success, error } =
        await vService.saveDiagnosticsToFile(
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
