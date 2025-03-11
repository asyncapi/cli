export type PluginHook = (...args: any[]) => Promise<any> | any;

export interface PluginHooks {
  [hookName: string]: PluginHook;
}

export interface AsyncAPIPlugin {
  name: string;
  version: string;
  description?: string;
  author?: string;
  
  register(): void;
  initialize?(): Promise<void>;
  cleanup?(): Promise<void>;
  
  hooks?: PluginHooks;
}

export enum ExtensionPoints {
  CLI_START = 'cli:start',
  CLI_EXIT = 'cli:exit',
  VALIDATE_BEFORE = 'validate:before',
  VALIDATE_AFTER = 'validate:after',
  GENERATE_BEFORE = 'generate:before',
  GENERATE_AFTER = 'generate:after',
}

export interface PluginConfig {
  enabled: boolean;
  options?: Record<string, any>;
}

export interface PluginsConfig {
  [pluginName: string]: PluginConfig;
}
