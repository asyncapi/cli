import { AsyncAPIDocumentInterface, Diagnostic } from '@asyncapi/parser/cjs';
import { OutputFormat } from '@stoplight/spectral-cli/dist/services/config';

/**
 * Supported diagnostic output formats for validation results.
 */
export type DiagnosticsFormat =
  | 'stylish'
  | 'json'
  | 'junit'
  | 'html'
  | 'text'
  | 'teamcity'
  | 'pretty';

/**
 * Severity levels for validation diagnostics.
 */
export type SeverityKind = 'error' | 'warn' | 'info' | 'hint';

/**
 * Adapter type for CLI or API usage.
 */
export type Adapter = 'cli' | 'api';

import specs from '@asyncapi/specs';
import { Router } from 'express';
import { AsyncAPIConvertVersion } from '@asyncapi/converter';

/**
 * Controller interface for Express routers.
 */
export interface Controller {
  basepath: string;
  boot(): Router | Promise<Router>;
}

/**
 * RFC 7807 Problem Details object.
 */
export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: string | number | undefined;
}

export type AsyncAPIDocument = { asyncapi: string } & Record<string, unknown>;

export const ALL_SPECS = [...Object.keys(specs)];
export const LAST_SPEC_VERSION = ALL_SPECS[ALL_SPECS.length - 1];

export type SpecsEnum = keyof typeof specs | 'latest';

export interface AsyncAPIServiceOptions {
  source?: string;
  path?: string;
}

/**
 * Standard service result wrapper for consistent response handling.
 *
 * @template T - The type of data returned on success
 */
export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  diagnostics?: Diagnostic[];
}

/**
 * Result of parsing an AsyncAPI document.
 */
export interface ParsedDocument {
  document: AsyncAPIDocumentInterface;
  diagnostics: Diagnostic[];
  status: 'valid' | 'invalid';
}

/**
 * Options for document validation.
 */
export interface ValidationOptions {
  'log-diagnostics'?: boolean;
  'diagnostics-format'?: `${OutputFormat}`;
  'fail-severity'?: SeverityKind;
  output?: string;
  suppressWarnings?: string[];
  suppressAllWarnings?: boolean;
  ruleset?: string;
}

/**
 * Result of document validation.
 */
export interface ValidationResult {
  status: 'valid' | 'invalid';
  document?: AsyncAPIDocument;
  diagnostics?: Diagnostic[];
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

/**
 * Base URL mapping configuration for template generation.
 */
export interface IMapBaseUrlToFlag {
  url: string;
  folder: string;
}

/**
 * Configuration for npm registry authentication.
 */
export interface RegistryConfig {
  url?: string;
  auth?: string;
  token?: string;
}

/**
 * Options for code generation from AsyncAPI documents.
 */
export interface GenerationOptions {
  templateParams?: Record<string, unknown>;
  forceWrite?: boolean;
  install?: boolean;
  debug?: boolean;
  noOverwriteGlobs?: string[];
  disabledHooks?: Record<string, string>;
  mapBaseUrl?: IMapBaseUrlToFlag;
  registry?: RegistryConfig;
}

/**
 * Result of a code generation operation.
 */
export interface GenerationResult {
  success: boolean;
  outputPath: string;
  logs?: string[];
}
