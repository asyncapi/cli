import { Command, Args } from '@oclif/core';
import chalk from 'chalk';
import { pluginRegistry } from '../core/utils/plugins/pluginRegistry';
import { loadUserConfigPluginsFromInput } from '../core/utils/plugins/loader';
import { table } from 'table';

export default class PluginsCommand extends Command {
  static description = 'Manage AsyncAPI CLI plugins';
  
  static examples = [
    '<%= config.bin %> plugins',
    '<%= config.bin %> plugins:list',
    '<%= config.bin %> plugins:info <plugin-name>'
  ];
  
  static args = {
    action: Args.string({
      description: 'Action to perform',
      default: 'list',
      options: ['list', 'info']
    }),
    plugin: Args.string({
      description: 'Plugin name (required for info action)',
      required: false
    })
  };
  
  async run() {
    const { args } = await this.parse(PluginsCommand);
    
    await loadUserConfigPluginsFromInput();
    
    switch (args.action) {
    case 'list':
      this.listPlugins();
      break;
    case 'info':
      this.showPluginInfo(args.plugin);
      break;
    default:
      this.listPlugins();
    }
  }
  
  private listPlugins() {
    const plugins = pluginRegistry.getAllPlugins();
    
    if (plugins.length === 0) {
      this.log(chalk.yellow('No plugins installed.'));
      return;
    }
    
    const tableData = [
      ['Name', 'Version', 'Description'].map(header => chalk.bold(header))
    ];
    
    for (const plugin of plugins) {
      tableData.push([
        plugin.name,
        plugin.version,
        plugin.description || ''
      ]);
    }    
    
    this.log(chalk.bold('\nInstalled Plugins:'));
    this.log(table(tableData));
  }
  
  private showPluginInfo(pluginName?: string) {
    if (!pluginName) {
      this.error('Plugin name is required for info action');
      return;
    }
    
    const plugin = pluginRegistry.getPlugin(pluginName);
    
    if (!plugin) {
      this.error(`Plugin '${pluginName}' not found`);
      return;
    }
    
    this.log(chalk.bold(`\nPlugin: ${plugin.name}`));
    this.log(`Version: ${plugin.version}`);
    
    if (plugin.description) {
      this.log(`Description: ${plugin.description}`);
    }
    
    if (plugin.author) {
      this.log(`Author: ${plugin.author}`);
    }
    
    if (plugin.hooks && Object.keys(plugin.hooks).length > 0) {
      this.log(chalk.bold('\nHooks:'));
      for (const hook of Object.keys(plugin.hooks)) {
        this.log(`- ${hook}`);
      }      
    }
  }
}
