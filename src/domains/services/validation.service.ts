import { BaseService } from './base.service';
import {
  ValidationOptions,
  ValidationResult,
  ServiceResult,
  ParsedDocument,
  DiagnosticsFormat,
  SeverityKind,
} from '@/interfaces';
import { AvroSchemaParser } from '@asyncapi/avro-schema-parser';
import { OpenAPISchemaParser } from '@asyncapi/openapi-schema-parser';
import { DiagnosticSeverity, Parser } from '@asyncapi/parser/cjs';
import { RamlDTSchemaParser } from '@asyncapi/raml-dt-schema-parser';
import { ProtoBuffSchemaParser } from '@asyncapi/protobuf-schema-parser';
import { getDiagnosticSeverity } from '@stoplight/spectral-core';
import {
  html,
  json,
  junit,
  pretty,
  stylish,
  teamcity,
  text,
} from '@stoplight/spectral-formatters';
import { red, yellow, green, cyan } from 'chalk';
import { promises } from 'fs';
import path from 'path';

import type { Diagnostic } from '@asyncapi/parser/cjs';
import { Specification } from '@models/SpecificationFile';
import { ParseOptions } from '@asyncapi/parser';
import { ParserOptions } from '@asyncapi/parser/cjs/parser';
import { calculateScore } from '@/utils/scoreCalculator';

const { writeFile } = promises;

export enum ValidationStatus {
  INVALID = 'invalid',
  VALID = 'valid',
}

const formatExtensions: Record<DiagnosticsFormat, string> = {
  stylish: '.txt',
  json: '.json',
  junit: '.xml',
  html: '.html',
  text: '.txt',
  teamcity: '.txt',
  pretty: '.txt',
};

const validFormats = [
  'stylish',
  'json',
  'junit',
  'html',
  'text',
  'teamcity',
  'pretty',
];

export class ValidationService extends BaseService {
  private parser: Parser;

  constructor(parserOptions: ParserOptions = {}) {
    super();
    this.parser = new Parser({
      ...parserOptions,
      __unstable: {
        resolver: {
          cache: false,
        },
        ...parserOptions.__unstable?.resolver,
      },
    });

    this.parser.registerSchemaParser(OpenAPISchemaParser());
    this.parser.registerSchemaParser(RamlDTSchemaParser());
    this.parser.registerSchemaParser(AvroSchemaParser());
    this.parser.registerSchemaParser(ProtoBuffSchemaParser());
  }

  /**
   * Determine validation status from diagnostics
   */
  private determineDiagnosticsStatus(
    diagnostics: Diagnostic[],
    options: ValidationOptions,
  ): ValidationStatus {
    const failSeverity = options['fail-severity'] ?? 'error';
    const hasIssues = diagnostics.length > 0;
    const isFailSeverity =
      hasIssues && this.hasFailSeverity(diagnostics, failSeverity);

    return isFailSeverity ? ValidationStatus.INVALID : ValidationStatus.VALID;
  }

  /**
   * Parses an AsyncAPI document and returns the parsed result
   */
  async parseDocument(
    specFile: Specification,
    parseOptions?: ParseOptions,
    options: ValidationOptions = {},
  ): Promise<ServiceResult<ParsedDocument>> {
    try {
      const { document, diagnostics } = await this.parser.parse(
        specFile.text(),
        {
          source: specFile.getSource(),
          ...parseOptions,
        },
      );

      if (!document) {
        return this.createErrorResult('Failed to parse document');
      }

      const status = this.determineDiagnosticsStatus(diagnostics, options);

      const result: ParsedDocument = {
        document,
        diagnostics,
        status: status as 'valid' | 'invalid',
      };

      return this.createSuccessResult(result);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Validates an AsyncAPI document
   */
  async validateDocument(
    specFile: Specification,
    options: ValidationOptions = {},
  ): Promise<ServiceResult<ValidationResult>> {
    try {
      const suppressAllWarnings = options.suppressAllWarnings ?? false;
      const suppressedWarnings = options.suppressWarnings ?? [];
      let activeParser: Parser;

      if (suppressAllWarnings || suppressedWarnings.length) {
        activeParser = await this.buildAndRegisterCustomParser(
          specFile,
          suppressedWarnings,
          suppressAllWarnings,
        );
      } else {
        activeParser = this.parser;
      }

      const { document, diagnostics } = await activeParser.parse(
        specFile.text(),
        {
          source: specFile.getSource(),
        },
      );

      const status = this.determineDiagnosticsStatus(diagnostics, options);

      const result: ValidationResult = {
        status: status as 'valid' | 'invalid',
        diagnostics,
        score: await calculateScore(document),
        document: document?.json ? document.json() : undefined,
      };

      return this.createSuccessResult<ValidationResult>(result);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Helper to build and register a custom parser with suppressed rules
   */
  private async buildAndRegisterCustomParser(
    specFile: Specification,
    suppressedWarnings: string[],
    suppressAllWarnings: boolean,
  ): Promise<Parser> {
    // Helper to build a parser with given rules turned off
    const buildCustomParser = (rulesToSuppress: string[]) =>
      new Parser({
        ruleset: {
          extends: [],
          rules: Object.fromEntries(
            rulesToSuppress.map((rule) => [rule, 'off']),
          ),
        },
        __unstable: {
          resolver: {
            cache: false,
          },
        },
      });

    let activeParser: Parser;

    if (suppressAllWarnings || suppressedWarnings.length) {
      if (suppressAllWarnings) {
        // Run the default parser to discover all rule codes
        const diagnostics = await this.parser.validate(specFile.text(), {
          source: specFile.getSource(),
        });
        const allRuleNames = Array.from(
          new Set(
            diagnostics
              .map((d) => d.code)
              .filter((c): c is string => typeof c === 'string'),
          ),
        );
        activeParser = buildCustomParser(allRuleNames);
      } else {
        try {
          activeParser = buildCustomParser(suppressedWarnings);
        } catch (e: any) {
          const msg = e.message || '';
          const matches = [
            ...msg.matchAll(/Cannot extend non-existing rule: "([^"]+)"/g),
          ];
          const invalidRules = matches.map((m) => m[1]);
          if (invalidRules.length > 0) {
            const validRules = suppressedWarnings.filter(
              (rule) => !invalidRules.includes(rule),
            );
            activeParser = buildCustomParser(validRules);
          } else {
            throw e;
          }
        }
      }

      // Register schema parsers for active parser
      activeParser.registerSchemaParser(AvroSchemaParser());
      activeParser.registerSchemaParser(OpenAPISchemaParser());
      activeParser.registerSchemaParser(RamlDTSchemaParser());
      activeParser.registerSchemaParser(ProtoBuffSchemaParser());
    } else {
      throw new Error('No rules to suppress provided');
    }

    return activeParser;
  }

  /**
   * Save validation diagnostics to file
   */
  async saveDiagnosticsToFile(
    outputPath: string,
    format: DiagnosticsFormat,
    formatOutput: string,
  ): Promise<ServiceResult<string>> {
    try {
      if (!validFormats.includes(format)) {
        return this.createErrorResult(
          `Invalid diagnostics format: "${format}"`,
        );
      }

      const expectedExtension =
        formatExtensions[format as keyof typeof formatExtensions];
      const actualExtension = path.extname(outputPath);

      // Validate file extension against diagnostics format
      if (expectedExtension && actualExtension !== expectedExtension) {
        return this.createErrorResult(
          `Invalid file extension for format "${format}". Expected extension: "${expectedExtension}"`,
        );
      }

      await writeFile(path.resolve(process.cwd(), outputPath), formatOutput, {
        encoding: 'utf-8',
      });

      return this.createSuccessResult(outputPath);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generate governance message based on validation results
   */
  generateGovernanceMessage(
    sourceString: string,
    hasIssues: boolean,
    isFailSeverity: boolean,
  ): string {
    if (!hasIssues) {
      return `\n${sourceString} is valid! ${sourceString} and referenced documents don't have governance issues.`;
    }
    if (isFailSeverity) {
      return `\n${sourceString} and/or referenced documents have governance issues.`;
    }
    return `\n${sourceString} is valid but has (itself and/or referenced documents) governance issues.`;
  }

  /**
   * Check if diagnostics contain failure severity issues
   */
  private hasFailSeverity(
    diagnostics: Diagnostic[],
    failSeverity: SeverityKind,
  ): boolean {
    const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
    return diagnostics.some(
      (diagnostic) => diagnostic.severity <= diagnosticSeverity,
    );
  }

  /**
   * Format validation diagnostics output
   */
  formatDiagnosticsOutput(
    diagnostics: Diagnostic[],
    format: DiagnosticsFormat = 'stylish',
    failSeverity: SeverityKind = 'error',
  ): string {
    const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
    const options = {
      failSeverity:
        diagnosticSeverity !== -1
          ? diagnosticSeverity
          : DiagnosticSeverity.Error,
    };

    switch (format) {
    case 'stylish':
      return this.formatStylish(diagnostics, options);
    case 'json':
      return json(diagnostics, options);
    case 'junit':
      return junit(diagnostics, options);
    case 'html':
      return html(diagnostics, options);
    case 'text':
      return text(diagnostics, options);
    case 'teamcity':
      return teamcity(diagnostics, options);
    case 'pretty':
      return pretty(diagnostics, options);
    default:
      return stylish(diagnostics, options);
    }
  }

  /**
   * Format diagnostics in stylish format with severity grouping
   */
  private formatStylish(
    diagnostics: Diagnostic[],
    options: { failSeverity: DiagnosticSeverity },
  ): string {
    const groupedDiagnostics = diagnostics.reduce(
      (acc, diagnostic) => {
        const severity = diagnostic.severity;
        if (!acc[severity as DiagnosticSeverity]) {
          acc[severity as DiagnosticSeverity] = [];
        }
        acc[severity as DiagnosticSeverity].push(diagnostic);
        return acc;
      },
      {} as Record<DiagnosticSeverity, Diagnostic[]>,
    );

    return Object.entries(groupedDiagnostics)
      .map(([severity, diagnostics]) => {
        return `${this.getSeverityTitle(Number(severity))} ${stylish(diagnostics, options)}`;
      })
      .join('\n');
  }

  /**
   * Get colored severity title
   */
  private getSeverityTitle(severity: DiagnosticSeverity): string {
    switch (severity) {
    case DiagnosticSeverity.Error:
      return red('Errors');
    case DiagnosticSeverity.Warning:
      return yellow('Warnings');
    case DiagnosticSeverity.Information:
      return cyan('Information');
    case DiagnosticSeverity.Hint:
      return green('Hints');
    default:
      return 'Unknown';
    }
  }
}
