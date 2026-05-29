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
 *
 * FIX (Issue #1940): Das ursprüngliche Regex-Pattern war:
 *   /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/
 *
 * Dieses Pattern schlug fehl, wenn der Branch-Name einen Schrägstrich enthielt
 * (z.B. "feature/new-validation"), weil ([^\/]+) nach dem ersten '/' aufhört
 * zu matchen. Dadurch wird bei
 *   https://github.com/org/repo/blob/feature/new-validation/spec.yaml
 * der branch als "feature", der filePath als "new-validation/spec.yaml" geparst —
 * was zu einer falschen API-URL mit ?ref=feature führt und einen 404 erzeugt.
 *
 * Die Lösung: Wir bestimmen den Dateinamen (letztes Segment) und den
 * Pfad-nach-blob greedy. Branch-Ende kann nicht verlässlich durch Regex
 * allein bestimmt werden, wenn Branches Slashes enthalten.
 *
 * Korrekte Strategie: Die GitHub-API akzeptiert den vollständigen Pfad hinter
 * /blob/ im ?ref= Parameter NICHT — stattdessen muss man den Pfad
 * korrekt in "ref" (branch) und "filePath" aufteilen. Da wir ohne API-Aufruf
 * nicht wissen, wo der Branch aufhört, greifen wir auf die korrekte
 * GitHub-Raw-URL-Konvertierung zurück:
 *
 *   https://github.com/owner/repo/blob/BRANCH_WITH_SLASHES/path/to/file.yaml
 *   → https://api.github.com/repos/owner/repo/contents/path/to/file.yaml?ref=BRANCH_WITH_SLASHES
 *
 * Dafür verwenden wir ein greedy-Matching für branch+path und teilen dann
 * nach dem letzten '.' in der URL, um owner/repo/blob/ zu extrahieren,
 * und übergeben den gesamten Rest nach /blob/ als kombinierte ref+path.
 *
 * Implementiert als: Wir sundam alles hinter /blob/ und übergeben
 * owner + repo korrekt. Da die GitHub-API den ref als Query-Parameter erwartet
 * und Dateipfade beliebig tief sein können, teilen wir hinter /blob/ und
 * verwenden das gesamte Segment als fileRef, wobei die API-URL dann
 * /contents/{alles-nach-blob-ohne-branch}?ref={branch} erhalten muss.
 *
 * Pragmatische robuste Lösung: Wir greifen auf ein Named-Group-Pattern zurück,
 * das owner, repo und den gesamten Rest nach /blob/ extrahiert. Dann bauen wir
 * die raw.githubusercontent.com URL, die keine Branch/Path-Aufteilung benötigt.
 */
const convertGitHubWebUrl = (url: string): string => {
  // Remove fragment from URL before processing
  const urlWithoutFragment = url.split('#')[0];

  // FIX (Issue #1940, Bug 1): Neues Pattern für GitHub blob URLs mit Branches,
  // die Schrägstriche enthalten (z.B. feature/new-validation).
  //
  // VORHER (buggy):
  //   /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/
  //   Capture-Gruppe 3 ([^\/]+) stoppte beim ersten '/' im Branch-Namen.
  //
  // NACHHER (fix):
  //   Wir erfassen owner und repo (beide ohne '/'), dann '/blob/' als Literal,
  //   dann den gesamten Rest (branch + '/' + filePath) als eine Gruppe.
  //   Anschließend konvertieren wir in eine raw.githubusercontent.com URL, die
  //   keine explizite Trennung von Branch und Pfad benötigt:
  //     https://raw.githubusercontent.com/owner/repo/ref/path/to/file
  //   Diese URL wird dann vom Custom-Resolver via fetchWithErrorHandling geladen.
  //
  // Alternativ: Wenn wir die GitHub API URL aufbauen wollen, müssen wir
  // branch von filePath trennen — was ohne Kenntnis der existierenden Branches
  // nicht zuverlässig möglich ist. Daher: raw.githubusercontent.com verwenden,
  // was branch+path direkt akzeptiert.
  // eslint-disable-next-line no-useless-escape
  const githubWebPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/(.+)$/;
  const match = urlWithoutFragment.match(githubWebPattern);

  if (match) {
    const [, owner, repo, branchAndPath] = match;
    // Konvertiere zu raw.githubusercontent.com — diese URL unterstützt
    // branch-Namen mit Schr�lnxaostricdhen ohne weitere Aufteilung.
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branchAndPath}`;
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
}
