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
import { promises } from 'fs';
import path from 'path';
import os from 'os';
import fs from 'fs';
import micromatch from 'micromatch';
type DiagnosticsFormat = 'stylish' | 'json' | 'junit' | 'html' | 'text' | 'teamcity' | 'pretty';

export type SeverityKind = 'error' | 'warn' | 'info' | 'hint';

export { convertToOldAPI };

const { writeFile } = promises;

const formatExtensions: Record<DiagnosticsFormat, string> = {
  stylish: '.txt',
  json: '.json',
  junit: '.xml',
  html: '.html',
  text: '.txt',
  teamcity: '.txt',
  pretty: '.txt',
};

const validFormats = ['stylish', 'json', 'junit', 'html', 'text', 'teamcity', 'pretty'];

type AuthEntry = {
  pattern: string;
  token: string;
};

const CONFIG_FILE = path.join(os.homedir(), '.asyncapi', 'config.json');

function loadAuthEntries(): AuthEntry[] {
  if (!fs.existsSync(CONFIG_FILE)) { return [];}
  const content = fs.readFileSync(CONFIG_FILE, 'utf8');
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed?.auth) ? parsed.auth : [];
  } catch (e) {
    console.error('❌ Invalid JSON in config file:', e);
    return [];
  }
}

function normalizeRawGitUrl(uri: URI): string {
  // Converts: raw.githubusercontent.com/org/repo/branch/path → https://github.com/org/repo/tree/branch
  const segments = uri.path().split('/').filter(Boolean); // Remove empty segments
  if (segments.length < 3) { return uri.toString(); }

  const [org, repo, branch] = segments;
  return `https://github.com/${org}/${repo}/tree/${branch}`;
}

const customResolver = {
  schema: 'https',
  order: 1,

  canRead: (uri: URI) => uri.hostname() === 'raw.githubusercontent.com',

  read: async (uri: URI) => {
    const url = uri.toString();
    const normalized = normalizeRawGitUrl(uri);
    const entries = loadAuthEntries();
    const matched = entries.find(entry =>
      micromatch.isMatch(normalized, entry.pattern)
    );

    const headers: Record<string, string> = {};
    if (matched) {
      const token = matched.token.startsWith('$')
        ? process.env[matched.token.slice(1)] || ''
        : matched.token;
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${url} - ${res.statusText}`);
    }

    return await res.text();
  }
};

// Parser setup
const parser = new Parser({
  __unstable: {
    resolver: {
      cache: false,
      resolvers: [customResolver],
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
    output: Flags.string({
      description: 'The output file name. Omitting this flag the result will be printed in the console.',
      char: 'o' 
    })
  };
}

export interface ValidateOptions {
  'log-diagnostics'?: boolean;
  'diagnostics-format'?: `${OutputFormat}`;
  'fail-severity'?: SeverityKind;
  'output'?: string;
  suppressWarnings?: string[];
  suppressAllWarnings?: boolean;
}

export async function validate(
  command: Command,
  specFile: Specification,
  options: ValidateOptions = {}
) {
  const suppressAllWarnings = options.suppressAllWarnings ?? false;
  const suppressedWarnings = options.suppressWarnings ?? [];
  let activeParser: Parser;

  // Helper to build a parser with given rules turned off
  const buildCustomParser = (rulesToSuppress: string[]) =>
    new Parser({
      ruleset: {
        extends: [],
        rules: Object.fromEntries(rulesToSuppress.map(rule => [rule, 'off'])),
      },
      __unstable: {
        resolver: {
          cache: false,
          resolvers: [customResolver],
        },
      },
    });

  if (suppressAllWarnings) {
    // Run the default parser to discover all rule codes
    const diagnostics = await parser.validate(specFile.text(), {
      source: specFile.getSource(),
    });
    const allRuleNames = Array.from(
      new Set(diagnostics.map(d => d.code).filter((c): c is string => typeof c === 'string'))
    );
    activeParser = buildCustomParser(allRuleNames);
  } else if (suppressedWarnings.length === 0) {
    activeParser = parser;
  } else {
    try {
      activeParser = buildCustomParser(suppressedWarnings);
    } catch (e: any) {
      const msg = e.message || '';
      const matches = [...msg.matchAll(/Cannot extend non-existing rule: "([^"]+)"/g)];
      const invalidRules = matches.map(m => m[1]);
      if (invalidRules.length > 0) {
        for (const rule of invalidRules) {
          command.log(`Warning: '${rule}' is not a known rule and will be ignored.`);
        }
        const validRules = suppressedWarnings.filter(rule => !invalidRules.includes(rule));
        activeParser = buildCustomParser(validRules);
      } else {
        throw e;
      }
    }
  }

  // Register schema parsers
  activeParser.registerSchemaParser(AvroSchemaParser());
  activeParser.registerSchemaParser(OpenAPISchemaParser());
  activeParser.registerSchemaParser(RamlDTSchemaParser());
  activeParser.registerSchemaParser(ProtoBuffSchemaParser());

  const diagnostics = await activeParser.validate(specFile.text(), {
    source: specFile.getSource(),
  });

  return logDiagnostics(diagnostics, command, specFile, options);
}

export async function parse(command: Command, specFile: Specification, options: ValidateOptions = {}) {
  const { document, diagnostics } = await parser.parse(specFile.text(), { source: specFile.getSource() });
  const status = logDiagnostics(diagnostics, command, specFile, options);
  return { document, diagnostics, status };
}

function logDiagnostics(
  diagnostics: Diagnostic[],
  command: Command,
  specFile: Specification,
  options: ValidateOptions = {}
): 'valid' | 'invalid' {
  const logDiagnostics = options['log-diagnostics'];
  const failSeverity = options['fail-severity'] ?? 'error';
  const diagnosticsFormat = options['diagnostics-format'] ?? 'stylish';
  const sourceString = specFile.toSourceString();

  const hasIssues = diagnostics.length > 0;
  const isFailSeverity = hasIssues && hasFailSeverity(diagnostics, failSeverity);

  if (logDiagnostics) {
    logGovernanceMessage(command, sourceString, hasIssues, isFailSeverity);
    outputDiagnostics(command, diagnostics, diagnosticsFormat, failSeverity, options);
  }

  return isFailSeverity ? ValidationStatus.INVALID : ValidationStatus.VALID;
}

function logGovernanceMessage(
  command: Command,
  sourceString: string,
  hasIssues: boolean,
  isFailSeverity: boolean
) {
  if (!hasIssues) {
    command.log(`\n${sourceString} is valid! ${sourceString} and referenced documents don't have governance issues.`);
  } else if (isFailSeverity) {
    command.logToStderr(`\n${sourceString} and/or referenced documents have governance issues.`);
  } else {
    command.log(`\n${sourceString} is valid but has (itself and/or referenced documents) governance issues.`);
  }
}

function outputDiagnostics(
  command: Command,
  diagnostics: Diagnostic[],
  diagnosticsFormat: DiagnosticsFormat,
  failSeverity: SeverityKind,
  options: ValidateOptions
) {
  const diagnosticsOutput = formatOutput(diagnostics, diagnosticsFormat, failSeverity);
  if (options.output) {
    writeValidationDiagnostic(options.output, command, diagnosticsFormat, diagnosticsOutput);
  } else {
    command.log(diagnosticsOutput);
  }
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

async function writeValidationDiagnostic(outputPath: string, command: Command, format: DiagnosticsFormat, formatOutput: string) {
  if (!validFormats.includes(format)) {
    command.logToStderr(`Invalid diagnostics format: "${format}"`);
    return;
  }

  const expectedExtension = formatExtensions[format as keyof typeof formatExtensions];
  const actualExtension = path.extname(outputPath);

  // Validate file extension against diagnostics format
  if (expectedExtension && (actualExtension !== expectedExtension)) {
    command.logToStderr(`Invalid file extension for format "${format}". Expected extension: "${expectedExtension}"`);
  } else {
    await writeFile(path.resolve(process.cwd(), outputPath), formatOutput, {
      encoding: 'utf-8',
    }).catch(err => console.log(err));
  }
}
