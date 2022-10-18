import { Flags } from '@oclif/core';
import { Parser } from '@asyncapi/parser/cjs';
import { AvroSchemaParser } from '@asyncapi/parser/cjs/schema-parser/avro-schema-parser';
import { OpenAPISchemaParser } from '@asyncapi/parser/cjs/schema-parser/openapi-schema-parser';
import { RamlSchemaParser } from '@asyncapi/parser/cjs/schema-parser/raml-schema-parser';
import { getDiagnosticSeverity } from '@stoplight/spectral-core';
import { html, json, junit, stylish, teamcity, text, pretty } from '@stoplight/spectral-cli/dist/formatters';
import { OutputFormat } from '@stoplight/spectral-cli/dist/services/config';

import type Command from './base';
import type { Diagnostic } from '@asyncapi/parser/cjs';
import type { Specification } from './models/SpecificationFile';

export type SeveritytKind = 'error' | 'warn' | 'info' | 'hint';

const parser = new Parser({
  __unstable: {
    resolver: {
      cache: false,
    }
  }
});

parser.registerSchemaParser(AvroSchemaParser());
parser.registerSchemaParser(OpenAPISchemaParser());
parser.registerSchemaParser(RamlSchemaParser());

export function validationFlags() {
  return {
    'log-diagnostics': Flags.boolean({
      description: 'log validation diagnostics or not',
      default: true,
      allowNo: true,
    }),
    'diagnostics-format': Flags.enum({
      description: 'format to use for validation diagnostics',
      options: Object.values(OutputFormat),
      default: OutputFormat.STYLISH,
    }),
    'fail-severity': Flags.enum<SeveritytKind>({
      description: 'diagnostics of this level or above will trigger a failure exit code',
      options: ['error', 'warn', 'info', 'hint'],
      default: 'error',
    }),
  }
} 

interface ValidateOptions {
  'log-diagnostics'?: boolean;
  'diagnostics-format'?: `${OutputFormat}`;
  'fail-severity'?: SeveritytKind;
}

interface ParseOptions {
  'log-diagnostics'?: boolean;
  'diagnostics-format'?: `${OutputFormat}`;
  'fail-severity'?: SeveritytKind;
}

export async function validate(command: Command, specFile: Specification, options: ValidateOptions = {}) {
  const diagnostics = await parser.validate(specFile.text(), { source: specFile.getSource() });
  return logDiagnostics(diagnostics, command, specFile, options);
}

export async function parse(command: Command, specFile: Specification, options: ParseOptions = {}) {
  const { document, diagnostics } = await parser.parse(specFile.text(), { source: specFile.getSource() });
  const status = logDiagnostics(diagnostics, command, specFile, options);
  return { document, status };
}

function logDiagnostics(diagnostics: Diagnostic[], command: Command, specFile: Specification, options: ParseOptions = {}): 'valid' | 'invalid' {
  const logDiagnostics = options['log-diagnostics'];
  const failSeverity = options['fail-severity'] || 'error';
  const diagnosticsFormat = options['diagnostics-format'] || 'stylish';

  if (diagnostics.length) {
    if (hasFailSeverity(diagnostics, failSeverity)) {
      if (logDiagnostics) {
        command.logToStderr(`\n${specFile.toDetails()} and/or referenced documents have governance issues.\n`);
        command.logToStderr(formatOutput(diagnostics, diagnosticsFormat, failSeverity));
      }
      command.exit(1);
      return 'invalid';
    } else {
      if (logDiagnostics) {
        command.log(`\n${specFile.toDetails()} and/or referenced documents have governance issues.\n`);
        command.log(formatOutput(diagnostics, diagnosticsFormat, failSeverity));
      }
    }
  } else {
    if (logDiagnostics) {
      command.log(`\n${specFile.toDetails()} is valid! ${specFile.toDetails()} and referenced documents don't have governance issues.`);
    }
  }
  return 'valid';
}

function formatOutput(diagnostics: Diagnostic[], format: `${OutputFormat}`, failSeverity: SeveritytKind) {
  const options = { failSeverity: getDiagnosticSeverity(failSeverity) };
  switch(format) {
    case 'stylish': return stylish(diagnostics, options);
    case 'json': return json(diagnostics, options);
    case 'junit': return junit(diagnostics, options);
    case 'html': return html(diagnostics, options);
    case 'text': return text(diagnostics, options);
    case 'teamcity': return teamcity(diagnostics, options);
    case 'pretty': return pretty(diagnostics, options);
    default: return stylish(diagnostics, options);
  }
}

function hasFailSeverity(diagnostics: Diagnostic[], failSeverity: SeveritytKind) {
  const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
  return diagnostics.some(diagnostic => diagnostic.severity <= diagnosticSeverity);
}
