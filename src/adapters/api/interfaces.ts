import specs from '@asyncapi/specs';
import { Router } from 'express';

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
