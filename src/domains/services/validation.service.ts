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
import { OutputFormat } from '@stoplight/spectral-cli/dist/services/config';
import { version } from '@stoplight/spectral-cli/package.json';
import { getDiagnosticSeverity, Ruleset } from '@stoplight/spectral-core';
import {
  html,
  json,
  junit,
  pretty,
  stylish,
  teamcity,
  text,
  githubActions,
  sarif,
  codeClimate,
  markdown
} from '@stoplight/spectral-formatters';
import chalk from 'chalk';
import { promises } from 'fs';
import path from 'path';

import type { Diagnostic } from '@asyncapi/parser/cjs';
import { Specification } from '@models/SpecificationFile';
import { ParseOptions } from '@asyncapi/parser';
import { ParserOptions } from '@asyncapi/parser/cjs/parser';
import { calculateScore } from '@/utils/scoreCalculator';

import { ConfigService } from './config.service';

// GitHub API response type
interface GitHubFileInfo {
  download_url: string;
  content?: string;
  encoding?: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
}

/**
 * Helper function to validate if a URL is a GitHub blob URL
 */
const isValidGitHubBlobUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === 'github.com' &&
      parsedUrl.pathname.split('/')[3] === 'blob'
    );
  } catch {
    return false;
  }
};

/**
 * Convert GitHub web URL to API URL
 */
const convertGitHubWebUrl = (url: string): string => {
  // Remove fragment from URL before processing
  const urlWithoutFragment = url.split('#')[0];

  // Handle GitHub web URLs like: https://github.com/owner/repo/blob/branch/path
  // eslint-disable-next-line no-useless-escape
  const githubWebPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;
  const match = urlWithoutFragment.match(githubWebPattern);

  if (match) {
    const [, owner, repo, branch, filePath] = match;
    return `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  }

  return url;
};

/**
 * Helper function to fetch with error handling
 */
const fetchWithErrorHandling = async (
  url: string,
  headers: Record<string, string>,
  errorMessage: string,
): Promise<Response> => {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`${errorMessage}: ${url} - ${res.statusText}`);
  }
  return res;
};

/**
 * Helper function to fetch content from GitHub API
 */
const fetchGitHubApiContent = async (
  url: string,
  headers: Record<string, string>,
): Promise<string> => {
  headers['Accept'] = 'application/vnd.github.v3+json';
  const res = await fetchWithErrorHandling(
    url,
    headers,
    'Failed to fetch GitHub API URL',
  );
  const fileInfo = (await res.json()) as GitHubFileInfo;

  if (!fileInfo.download_url) {
    throw new Error(
      `No download URL found in GitHub API response for: ${url}`,
    );
  }

  const contentRes = await fetchWithErrorHandling(
    fileInfo.download_url,
    headers,
    'Failed to fetch content from download URL',
  );
  return await contentRes.text();
};

/**
 * Custom resolver for private repositories
 */
const createHttpWithAuthResolver = () => ({
  schema: 'https',
  order: 1,

  read: async (uri: any) => {
    let url = uri.toString();

    // Default headers
    const headers: Record<string, string> = {
      'User-Agent': 'AsyncAPI-CLI',
    };

    const authInfo = await ConfigService.getAuthForUrl(url);

    if (isValidGitHubBlobUrl(url)) {
      url = convertGitHubWebUrl(url);
    }

    if (authInfo) {
      headers['Authorization'] = `${authInfo.authType} ${authInfo.token}`;
      Object.assign(headers, authInfo.headers); // merge custom headers
    }

    if (url.includes('api.github.com')) {
      return await fetchGitHubApiContent(url, headers);
    }
    if (url.includes('raw.githubusercontent.com')) {
      headers['Accept'] = 'application/vnd.github.v3.raw';
      const res = await fetchWithErrorHandling(
        url,
        headers,
        'Failed to fetch GitHub URL',
      );
      return await res.text();
    }
    const res = await fetchWithErrorHandling(
      url,
      headers,
      'Failed to fetch URL',
    );
    return await res.text();
  },
});

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
  'github-actions': '.txt',
  sarif: '.json',
  'code-climate': '.json',
  gitlab: '.json',
  markdown: '.md',
};

const validFormats = [
  'stylish',
  'json',
  'junit',
  'html',
  'text',
  'teamcity',
  'pretty',
  'github-actions',
  'sarif',
  'code-climate',
  'gitlab',
  'markdown',
];

export class ValidationService extends BaseService {
  private parser: Parser;

  constructor(parserOptions: ParserOptions = {}) {
    super();
    // Create parser with custom GitHub resolver
    const customParserOptions = {
      ...parserOptions,
      __unstable: {
        ...parserOptions.__unstable,
        resolver: {
          ...parserOptions.__unstable?.resolver,
          cache: false,
          resolvers: [
            createHttpWithAuthResolver(),
            ...(parserOptions.__unstable?.resolver?.resolvers || [])
          ],
        },
      },
    };

    this.parser = new Parser(customParserOptions);

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
   * Creates a custom parser with specific rules turned off.
   */
  private buildCustomParser(rulesToSuppress: string[]): Parser {
    return new Parser({
      ruleset: {
        extends: [],
        rules: Object.fromEntries(
          rulesToSuppress.map((rule) => [rule, 'off']),
        ),
      },
      __unstable: {
        resolver: {
          cache: false,
          resolvers: [createHttpWithAuthResolver()],
        },
      },
    });
  }

  /**
   * Registers all schema parsers for the given parser instance.
   */
  private registerSchemaParsers(parser: Parser): void {
    parser.registerSchemaParser(AvroSchemaParser());
    parser.registerSchemaParser(OpenAPISchemaParser());
    parser.registerSchemaParser(RamlDTSchemaParser());
    parser.registerSchemaParser(ProtoBuffSchemaParser());
  }

  /**
   * Builds a parser that suppresses all discovered warnings.
   */
  private async buildParserWithAllWarningsSuppressed(
    specFile: Specification
  ): Promise<Parser> {
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
    return this.buildCustomParser(allRuleNames);
  }

  /**
   * Builds a parser that suppresses specific warnings, handling invalid rules gracefully.
   */
  private buildParserWithSpecificWarningsSuppressed(
    suppressedWarnings: string[]
  ): Parser {
    try {
      return this.buildCustomParser(suppressedWarnings);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      const matches = [
        ...msg.matchAll(/Cannot extend non-existing rule: "([^"]+)"/g),
      ];
      const invalidRules = matches.map((m) => m[1]);
      if (invalidRules.length > 0) {
        const validRules = suppressedWarnings.filter(
          (rule) => !invalidRules.includes(rule),
        );
        return this.buildCustomParser(validRules);
      }
      throw e;
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
    if (!suppressAllWarnings && !suppressedWarnings.length) {
      throw new Error('No rules to suppress provided');
    }

    const activeParser = suppressAllWarnings
      ? await this.buildParserWithAllWarningsSuppressed(specFile)
      : this.buildParserWithSpecificWarningsSuppressed(suppressedWarnings);

    this.registerSchemaParsers(activeParser);
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
    case OutputFormat.STYLISH:
      return this.formatStylish(diagnostics, options);
    case OutputFormat.JSON:
      return json(diagnostics, options);
    case OutputFormat.JUNIT:
      return junit(diagnostics, options);
    case OutputFormat.HTML:
      return html(diagnostics, options);
    case OutputFormat.TEXT:
      return text(diagnostics, options);
    case OutputFormat.TEAMCITY:
      return teamcity(diagnostics, options);
    case OutputFormat.PRETTY:
      return pretty(diagnostics, options);
    case OutputFormat.GITHUB_ACTIONS:
      return githubActions(diagnostics, options);
    case OutputFormat.SARIF:
      return sarif(diagnostics, options, { ruleset: new Ruleset({rules: {}}), spectralVersion: version });
    case OutputFormat.CODE_CLIMATE:
    case OutputFormat.GITLAB:
      return codeClimate(diagnostics, options);
    case OutputFormat.MARKDOWN:
      return markdown(diagnostics, options);
    default:
      return this.formatStylish(diagnostics, options);
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
      return chalk.red('Errors');
    case DiagnosticSeverity.Warning:
      return chalk.yellow('Warnings');
    case DiagnosticSeverity.Information:
      return chalk.cyan('Information');
    case DiagnosticSeverity.Hint:
      return chalk.green('Hints');
    default:
      return 'Unknown';
    }
  }
}
