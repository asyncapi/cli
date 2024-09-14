import { AvroSchemaParser } from '@asyncapi/avro-schema-parser';
import { OpenAPISchemaParser } from '@asyncapi/openapi-schema-parser';
import { DiagnosticSeverity, Parser, convertToOldAPI } from '@asyncapi/parser/cjs';
import { RamlDTSchemaParser } from '@asyncapi/raml-dt-schema-parser';
import { Flags } from '@oclif/core';
import { ProtoBuffSchemaParser } from '@asyncapi/protobuf-schema-parser';
import { getDiagnosticSeverity } from '@stoplight/spectral-core';
import { OutputFormat } from '@stoplight/spectral-cli/dist/services/config';
import { html, json, junit, pretty, stylish, teamcity, text } from '@stoplight/spectral-formatters';
import { red, yellow, green, cyan } from 'chalk';

import type { Diagnostic } from '@asyncapi/parser/cjs';
import type Command from './base';
import type { Specification } from './models/SpecificationFile';

export type SeverityKind = 'error' | 'warn' | 'info' | 'hint';

export { convertToOldAPI };

const parser = new Parser({
  __unstable: {
    resolver: {
      cache: false,
    }
  }
});

parser.registerSchemaParser(AvroSchemaParser());
parser.registerSchemaParser(OpenAPISchemaParser());
parser.registerSchemaParser(RamlDTSchemaParser());
parser.registerSchemaParser(ProtoBuffSchemaParser());

export interface ValidationFlagsOptions {
  logDiagnostics?: boolean;
}

export enum ValidationStatus {
  INVALID = 'invalid',
  VALID = 'valid',
}

export function validationFlags({ logDiagnostics = true }: ValidationFlagsOptions = {}) {
  return {
    'log-diagnostics': Flags.boolean({
      description: 'log validation diagnostics or not',
      default: logDiagnostics,
      allowNo: true,
    }),
    'diagnostics-format': Flags.option({
      description: 'format to use for validation diagnostics',
      options: Object.values(OutputFormat),
      default: OutputFormat.STYLISH,
    })(),
    'fail-severity': Flags.option({
      description: 'diagnostics of this level or above will trigger a failure exit code',
      options: ['error', 'warn', 'info', 'hint'] as const,
      default: 'error',
    })(),
  };
}

export interface ValidateOptions {
  'log-diagnostics'?: boolean;
  'diagnostics-format'?: `${OutputFormat}`;
  'fail-severity'?: SeverityKind;
}

export async function validate(command: Command, specFile: Specification, options: ValidateOptions = {}) {
  const diagnostics = await parser.validate(specFile.text(), { source: specFile.getSource() });
  return logDiagnostics(diagnostics, command, specFile, options);
}

export async function parse(command: Command, specFile: Specification, options: ValidateOptions = {}) {
  const { document, diagnostics } = await parser.parse(specFile.text(), { source: specFile.getSource() });
  const status = logDiagnostics(diagnostics, command, specFile, options);
  return { document, diagnostics, status };
}

function logDiagnostics(diagnostics: Diagnostic[], command: Command, specFile: Specification, options: ValidateOptions = {}): 'valid' | 'invalid' {
  const logDiagnostics = options['log-diagnostics'];
  const failSeverity = options['fail-severity'] ?? 'error';
  const diagnosticsFormat = options['diagnostics-format'] ?? 'stylish';

  const sourceString = specFile.toSourceString();
  if (diagnostics.length) {
    if (hasFailSeverity(diagnostics, failSeverity)) {
      if (logDiagnostics) {
        command.logToStderr(`\n${sourceString} and/or referenced documents have governance issues.`);
        command.logToStderr(formatOutput(diagnostics, diagnosticsFormat, failSeverity));
      }
      return ValidationStatus.INVALID;
    }

    if (logDiagnostics) {
      command.log(`\n${sourceString} is valid but has (itself and/or referenced documents) governance issues.`);
      command.log(formatOutput(diagnostics, diagnosticsFormat, failSeverity));
    }
  } else if (logDiagnostics) {
    command.log(`\n${sourceString} is valid! ${sourceString} and referenced documents don't have governance issues.`);
  }

  return ValidationStatus.VALID;
}

export function formatOutput(diagnostics: Diagnostic[], format: `${OutputFormat}`, failSeverity: SeverityKind) {
  const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
  const options = { failSeverity: diagnosticSeverity !== -1 ? diagnosticSeverity : DiagnosticSeverity.Error };
  switch (format) {
  case 'stylish': return formatStylish(diagnostics, options);
  case 'json': return json(diagnostics, options);
  case 'junit': return junit(diagnostics, options);
  case 'html': return html(diagnostics, options);
  case 'text': return text(diagnostics, options);
  case 'teamcity': return teamcity(diagnostics, options);
  case 'pretty': return pretty(diagnostics, options);
  default: return stylish(diagnostics, options);
  }
}

function formatStylish(diagnostics: Diagnostic[], options: { failSeverity: DiagnosticSeverity }) {
  const groupedDiagnostics = diagnostics.reduce((acc, diagnostic) => {
    const severity = diagnostic.severity;
    if (!acc[severity as DiagnosticSeverity]) {
      acc[severity as DiagnosticSeverity] = [];
    }
    acc[severity as DiagnosticSeverity].push(diagnostic);
    return acc;
  }, {} as Record<DiagnosticSeverity, Diagnostic[]>);

  return Object.entries(groupedDiagnostics).map(([severity, diagnostics]) => {
    return `${getSeverityTitle(Number(severity))} ${stylish(diagnostics, options)}`;
  }).join('\n');
}

function getSeverityTitle(severity: DiagnosticSeverity) {
  switch (severity) {
  case DiagnosticSeverity.Error: return red('Errors');
  case DiagnosticSeverity.Warning: return yellow('Warnings');
  case DiagnosticSeverity.Information: return cyan('Information');
  case DiagnosticSeverity.Hint: return green('Hints');
  }
}

function hasFailSeverity(diagnostics: Diagnostic[], failSeverity: SeverityKind) {
  const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
  return diagnostics.some(diagnostic => diagnostic.severity <= diagnosticSeverity);
}
