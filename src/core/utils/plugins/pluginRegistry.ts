import { AsyncAPIPlugin, PluginHook } from './types';

export class PluginRegistry {
  private plugins: Map<string, AsyncAPIPlugin> = new Map();
  private extensionPoints: Map<string, Array<{pluginName: string, hookFn: PluginHook}>> = new Map();

  public registerPlugin(plugin: AsyncAPIPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }
    
    this.plugins.set(plugin.name, plugin);
    
    for (const [hookName, hookFn] of Object.entries(plugin.hooks || {})) {
      if (!this.extensionPoints.has(hookName)) {
        this.extensionPoints.set(hookName, []);
      }
      this.extensionPoints.get(hookName)!.push({
        pluginName: plugin.name,
        hookFn
      });
    }    
  }

  public getPlugin(name: string): AsyncAPIPlugin | undefined {
    return this.plugins.get(name);
  }

  public getAllPlugins(): AsyncAPIPlugin[] {
    return Array.from(this.plugins.values());
  }

  public async executeHook<T = any>(hookName: string, ...args: any[]): Promise<T[]> {
    const hooks = this.extensionPoints.get(hookName) || [];
    return Promise.all(hooks.map(hook => hook.hookFn(...args))) as Promise<T[]>;
  }
}

export const pluginRegistry = new PluginRegistry();
