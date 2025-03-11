import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import yaml from 'js-yaml';
import { cosmiconfig } from 'cosmiconfig';
import { pluginRegistry } from './pluginRegistry';
import { PluginsConfig } from './types';

const MODULE_PREFIX = 'asyncapi-cli-plugin-';

export async function loadUserConfigPluginsFromInput(inputFilePath?: string): Promise<void> {
  let config: any;

  if (inputFilePath) {
    try {
      const content = await fs.readFile(inputFilePath, 'utf8');
      config = yaml.load(content);
    } catch (err) {
      console.error('Error reading input file:', err);
      return;
    }
  } else {
    const explorer = cosmiconfig('asyncapi');
    const result = await explorer.search();
    if (!result || !result.config) {
      console.error('No AsyncAPI configuration found via cosmiconfig.');
      return;
    }
    config = result.config;
    console.error('Loaded config via cosmiconfig:', config);
  }

  if (!config) {
    console.error('Configuration is empty or could not be parsed.');
    return;
  }

  let pluginsConfig: PluginsConfig | undefined;
  const configString = 'x-asyncapi-cli';
  if (config.plugins) {
    pluginsConfig = config.plugins;
  } else if (config[configString] && config[configString].plugins) {
    pluginsConfig = config[configString].plugins;
  }

  if (!pluginsConfig) {
    console.error('No plugin configuration found in the configuration file.');
    return;
  }

  const baseDir = inputFilePath ? path.dirname(inputFilePath) : process.cwd();
  console.error('Base directory for resolving plugins:', baseDir);
  console.error('process.cwd():', process.cwd());

  for (const [pluginName, pluginConfig] of Object.entries(pluginsConfig)) {
    if (pluginConfig.enabled) {
      console.error(`Processing plugin: ${pluginName}`);
      if (pluginName.startsWith('./') || pluginName.startsWith('/')) {
        const absolutePath = path.resolve(baseDir, pluginName);
        console.error('Absolute path for plugin:', absolutePath);

        if (!fsSync.existsSync(absolutePath)) {
          console.error('File not found at:', absolutePath);
          continue; // Skip loading this plugin
        }

        try {
          const fileUrl = pathToFileURL(absolutePath).href;
          console.error('Importing plugin from file URL:', fileUrl);
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const plugin = await import(absolutePath);
          if (plugin.default && typeof plugin.default.register === 'function') {
            plugin.default.register();
            if (typeof plugin.default.initialize === 'function') {
              await plugin.default.initialize(pluginConfig);
            }
            pluginRegistry.registerPlugin(plugin.default);
            console.error(`Registered user config plugin: ${plugin.default.name}`);
          } else {
            console.error(`Invalid plugin format in ${pluginName}`);
          }
        } catch (err) {
          console.error(`Failed to load user config plugin ${pluginName}:`, err);
        }
      } else if (!pluginRegistry.getPlugin(pluginName)) {
        try {
          const moduleName = pluginName.startsWith(MODULE_PREFIX)
            ? pluginName
            : `${MODULE_PREFIX}${pluginName}`;
          console.error('Importing plugin module:', moduleName);
          const pluginModule = await import(moduleName);
          if (pluginModule.default && typeof pluginModule.default.register === 'function') {
            pluginModule.default.register();
            if (typeof pluginModule.default.initialize === 'function') {
              await pluginModule.default.initialize(pluginConfig);
            }
            pluginRegistry.registerPlugin(pluginModule.default);
            console.error(`Registered user config plugin: ${pluginModule.default.name}`);
          } else {
            console.error(`Invalid plugin format in ${pluginName}`);
          }
        } catch (err) {
          console.error(`Failed to load user config plugin ${pluginName}:`, err);
        }
      }
    }
  }
}
