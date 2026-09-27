import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { load, Specification } from '@models/SpecificationFile';
import {
  emitWatchStarted,
  isWatchRerun,
  specWatcher,
} from '@cli/internal/globals';
import { validateFlags } from '@cli/internal/flags/validate.flags';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import {
  ServiceResult,
  ValidationOptions,
  ValidationResult,
} from '@/interfaces';
import {
  ValidationService,
  ValidationStatus,
} from '@services/validation.service';
import { applyProxyToPath } from '@utils/proxy';
import { Diagnostic, DiagnosticSeverity } from '@asyncapi/parser/cjs';
import path from 'path';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES, type CliErrorCode } from '@errors/error-codes';
import { existsSync } from 'fs';

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

  async run(): Promise<unknown> {
    const { args, flags } = await this.parse(Validate); //NOSONAR
    const filePath = applyProxyToPath(
      args['spec-file'],
      flags['proxyHost'],
      flags['proxyPort']
    );

    this.specFile = await load(filePath);
    const watchMode = flags.watch;
    const watchRerun = isWatchRerun(this);

    if (watchMode && !watchRerun) {
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

    const output = flags['log-diagnostics']
      ? await this.handleDiagnostics(result, flags)
      : null;

    const diagnostics = (result.data?.diagnostics ?? []).map(formatDiagnostic);
    const summary = diagnostics.reduce(
      (counts, diagnostic) => {
        const keys = {
          error: 'errors',
          warning: 'warnings',
          info: 'info',
          hint: 'hints',
        } as const;
        const key = keys[diagnostic.severity];
        counts[key] += 1;
        return counts;
      },
      { errors: 0, warnings: 0, info: 0, hints: 0 },
    );
    const data = {
      source: sourceData(args['spec-file'], this.specFile),
      valid: result.data?.status === ValidationStatus.VALID,
      score: result.data?.score ?? null,
      failSeverity: flags['fail-severity'] ?? 'error',
      diagnostics,
      summary,
      output,
      warnings: [],
    };

    if (result.data?.status === ValidationStatus.INVALID) {
      throw new ApplicationError(
        CLI_ERROR_CODES.SCHEMA_VALIDATION_FAILED,
        'The AsyncAPI document failed validation.',
        { details: data },
      );
    }

    const commandResult = this.result('The AsyncAPI document is valid.', data);
    if (watchMode && this.jsonEnabled() && !watchRerun) {
      const watchedFile = this.specFile.getFilePath();
      emitWatchStarted(
        this,
        commandResult,
        watchedFile ? [watchedFile] : [],
      );
      return;
    }

    return commandResult;
  }

  private async handleDiagnostics(
    result: ServiceResult<ValidationResult>,
    flags: any,
  ) {
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
      const overwritten = existsSync(path.resolve(writeOutput));
      const { success, error } =
        await this.validationService.saveDiagnosticsToFile(
          writeOutput,
          diagnosticsFormat,
          diagnosticsOutput,
        );

      if (!success) {
        const message = error || 'Failed to save diagnostics to file';
        let code: CliErrorCode = CLI_ERROR_CODES.FILE_WRITE_FAILED;
        if (message.includes('Invalid file extension')) {
          code = CLI_ERROR_CODES.DIAGNOSTICS_EXTENSION_MISMATCH;
        } else if (message.includes('Invalid diagnostics format')) {
          code = CLI_ERROR_CODES.DIAGNOSTICS_FORMAT_INVALID;
        }
        throw new ApplicationError(code, message);
      }
      this.log(`Diagnostics saved to ${writeOutput}`);
      return {
        path: path.resolve(writeOutput),
        format: diagnosticsFormat,
        overwritten,
      };
    }
    this.log(diagnosticsOutput);
    return null;
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

function formatDiagnostic(diagnostic: Diagnostic) {
  const severities = {
    [DiagnosticSeverity.Error]: 'error',
    [DiagnosticSeverity.Warning]: 'warning',
    [DiagnosticSeverity.Information]: 'info',
    [DiagnosticSeverity.Hint]: 'hint',
  } as const;
  return {
    code: String(diagnostic.code ?? ''),
    message: diagnostic.message,
    severity: severities[diagnostic.severity],
    path: diagnostic.path ?? [],
    range: diagnostic.range ?? null,
  };
}
