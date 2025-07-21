import { AsyncAPIDocumentInterface } from '@asyncapi/parser/cjs';
import { OutputFormat } from '@stoplight/spectral-cli/dist/services/config';

export type DiagnosticsFormat = 'stylish' | 'json' | 'junit' | 'html' | 'text' | 'teamcity' | 'pretty';
export type SeverityKind = 'error' | 'warn' | 'info' | 'hint';

export type Adapter = 'cli' | 'api';

import specs from '@asyncapi/specs';
import { Router } from 'express';
import { AsyncAPIConvertVersion } from '@asyncapi/converter';

export interface Controller {
  basepath: string;
  boot(): Router | Promise<Router>;
}

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: any;
}

export type AsyncAPIDocument = { asyncapi: string } & Record<string, unknown>;

export const ALL_SPECS = [...Object.keys(specs)];
export const LAST_SPEC_VERSION = ALL_SPECS[ALL_SPECS.length - 1];

export type SpecsEnum = keyof typeof specs | 'latest';

export interface AsyncAPIServiceOptions {
  source?: string;
  path?: string;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  diagnostics?: any[];
}

export interface ParsedDocument {
  document: AsyncAPIDocumentInterface;
  diagnostics: any[];
  status: 'valid' | 'invalid';
}

export interface ValidationOptions {
  'log-diagnostics'?: boolean;
  'diagnostics-format'?: `${OutputFormat}`;
  'fail-severity'?: SeverityKind;
  'output'?: string;
  suppressWarnings?: string[];
  suppressAllWarnings?: boolean;
}

export interface ValidationResult {
  status: 'valid' | 'invalid';
  document?: AsyncAPIDocument;
  diagnostics?: any[];
  score?: number;
}

export interface ConversionOptions {
  format: 'asyncapi' | 'openapi' | 'postman-collection';
  'target-version'?: AsyncAPIConvertVersion;
  perspective?: 'client' | 'server';
}

export interface ConversionResult {
  convertedDocument: string;
  originalFormat: string;
}

export interface GenerationOptions {
  template: string;
  output: string;
  parameters?: Record<string, any>;
  forceWrite?: boolean;
  install?: boolean;
  debug?: boolean;
  disableHooks?: string[];
  mapBaseUrl?: string;
  registry?: {
    url?: string;
    auth?: string;
    token?: string;
  };
}

export interface GenerationResult {
  success: boolean;
  outputPath: string;
  template: string;
}

export interface BundleOptions {
  base?: string;
  baseDir?: string;
  xOrigin?: boolean;
  output?: string;
}

export interface BundleResult {
  bundledDocument: any;
  format: 'yaml' | 'json';
}

export interface OptimizationOptions {
  optimizations?: string[];
  disableOptimizations?: string[];
  output?: 'terminal' | 'new-file' | 'overwrite';
  interactive?: boolean;
}

export interface OptimizationResult {
  optimizedDocument: string;
  report: any;
  outputMethod: string;
}

export interface DiffOptions {
  format?: 'json' | 'yaml' | 'yml' | 'markdown';
  type?: 'breaking' | 'non-breaking' | 'unclassified' | 'all';
  markdownSubtype?: 'json' | 'yaml' | 'yml';
  overrides?: string;
  noError?: boolean;
  watch?: boolean;
}

export interface DiffResult {
  diff: any;
  format: string;
  hasBreakingChanges: boolean;
}

export interface ModelGenerationOptions {
  language: string;
  output?: string;
  packageName?: string;
  namespace?: string;
  [key: string]: any; // For language-specific options
}
