---'@asyncapi/cli': feat---
Add plugin system to allow extending CLI with custom functionality

- Create Plugin System for discovering and loading plugins for input YAML files
- User will have to mention 'x-asyncapi-plugin' in YAML to specify plugin and give its javascript file's relative path
- Used hooks to edit the entry point of CLI and load a plugin before generation
- Created a PluginRegistry, loader, types to help load the functionality of plugin
