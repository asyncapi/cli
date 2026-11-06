import {ReplaceOperation, AddOperation} from 'fast-json-patch';

import {standard as v2Standard} from './standards/v2';
import {standard as v3Standard} from './standards/v3';
import {breaking, nonBreaking, unclassified} from './constants';

export type ActionType = 'add' | 'remove' | 'edit';

export type ChangeType =
  | typeof breaking
  | typeof nonBreaking
  | typeof unclassified;

export interface Classifier {
  add: ChangeType;
  remove: ChangeType;
  edit: ChangeType;
}

export interface DiffOutput {
  action: ActionType;
  path: string;
  isArrayIndex?: boolean;
  before?: any;
  after?: any;
}

export type DiffOutputItem = DiffOutput & {
  type: ChangeType;
};

export type Changes = DiffOutputItem[] | string;

export interface JSONOutput {
  changes: DiffOutputItem[];
}

export type Output = JSONOutput | string;

export type ValueOperation = ReplaceOperation<any> | AddOperation<any>;

export type StandardType = typeof v2Standard | typeof v3Standard;

export interface OverrideObject {
  [key: string]: Classifier;
}

export type OverrideStandard = StandardType & OverrideObject;

export type OutputType = 'json' | 'yaml' | 'yml' | 'markdown' | 'md';

export type MarkdownSubtype = 'json' | 'yaml' | 'yml';

export interface FormatterConfig<T> {
  data: T,
  outputType: OutputType,
  markdownSubtype: MarkdownSubtype
}

export interface ChangeMarkdownGenerationConfig {
  change: { path: string, any: any },
  markdownSubtype: MarkdownSubtype
}

export interface MarkdownDropdownGenerationConfig {
  label: string,
  data: { string: any },
  markdownSubtype: MarkdownSubtype
}

export interface AsyncAPIDiffOptions {
  outputType: OutputType;
  markdownSubtype?: MarkdownSubtype;
}

export interface Config {
  override?: OverrideObject;
  outputType?: OutputType;
  markdownSubtype?: MarkdownSubtype;
}
