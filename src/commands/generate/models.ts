import { CSharpFileGenerator, JavaFileGenerator, JavaScriptFileGenerator, TypeScriptFileGenerator, GoFileGenerator, Logger, DartFileGenerator, PythonFileGenerator, RustFileGenerator } from '@asyncapi/modelina';
import { Flags } from '@oclif/core';
import Command from '../../base';
import path from 'path';
import { load } from '../../models/SpecificationFile';
import { parse } from '../../utils/parser';
enum Languages {
  typescript = 'typescript',
  csharp = 'csharp',
  golang = 'golang',
  java = 'java',
  javascript = 'javascript',
  dart = 'dart',
  python = 'python',
  rust = 'rust'
}
const possibleLanguageValues = Object.values(Languages).join(', ');
export default class Models extends Command {
  static description = 'Generates typed models';
  static args = [
    {
      name: 'language',
      description: 'The language you want the typed models generated for.',
      options: Object.keys(Languages),
      required: true
    },
    { name: 'file', description: 'Path or URL to the AsyncAPI document, or context-name', required: true },
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({
      char: 'o',
      description: 'The output directory where the models should be written to. Omitting this flag will write the models to `stdout`.',
      required: false
    }),
    configFile: Flags.string({
      char: 'c',
      description: 'Path to config file',
      required: false
    }),
    /**
     * TypeScript specific options
     */
    tsModelType: Flags.string({
      type: 'option',
      options: ['class', 'interface'],
      description: 'TypeScript specific, define which type of model needs to be generated.',
      required: false,
    }),
    tsEnumType: Flags.string({
      type: 'option',
      options: ['enum', 'union'],
      description: 'TypeScript specific, define which type of enums needs to be generated.',
      required: false,
    }),
    tsModuleSystem: Flags.string({
      type: 'option',
      options: ['ESM', 'CJS'],
      description: 'TypeScript specific, define the module system to be used.',
      required: false,
    }),
    tsExportType: Flags.string({
      type: 'option',
      options: ['default', 'named'],
      description: 'TypeScript specific, define which type of export needs to be generated.',
      required: false,
    }),
    /**
     * Go and Java specific package name to use for the generated models
     */
    packageName: Flags.string({
      description: 'Go and Java specific, define the package to use for the generated models. This is required when language is `go` or `java`.',
      required: false
    }),
    /**
     * C# specific options
     */
    namespace: Flags.string({
      description: 'C# specific, define the namespace to use for the generated models. This is required when language is `csharp`.',
      required: false
    }),
    
  };

  async run() {
    const { args, flags } = await this.parse(Models);
    const { tsModelType, tsEnumType, tsModuleSystem, tsExportType, namespace, packageName, output } = flags;
    const { language, file } = args;

    const inputFile = await load(file) || await load();
    const parsedInput = await parse(inputFile.text());
    let defaultConfig = {};
    if(flags.configFile !== undefined) {
      try {
        defaultConfig = await import(path.resolve(process.cwd(), flags.configFile));
      } catch(e: any) {
        this.error(`There was an error trying to load the Modelina configuration file, it will be ignored. The following error was triggered: ${e}`);
      }
    }
    Logger.setLogger({
      info: (message) => {
        this.log(message);
      },
      debug: (message) => {
        this.debug(message);
      },
      warn: (message) => {
        this.warn(message);
      },
      error: (message) => {
        this.error(message);
      },
    });
    let fileGenerator;
    let fileOptions = {};
    switch (language) {
    case Languages.typescript:
      fileGenerator = new TypeScriptFileGenerator({
        ...defaultConfig, 
        ...{
          modelType: tsModelType as undefined | 'class' | 'interface',
          enumType: tsEnumType as undefined | 'enum' | 'union'
        }
      });
      fileOptions = {
        moduleSystem: tsModuleSystem,
        exportType: tsExportType
      };
      break;
    case Languages.python:
      fileGenerator = new PythonFileGenerator(defaultConfig);
      break;
    case Languages.rust:
      fileGenerator = new RustFileGenerator(defaultConfig);
      break;
    case Languages.csharp:
      if (namespace === undefined) {
        throw new Error('In order to generate models to C#, we need to know which namespace they are under. Add `--namespace=NAMESPACE` to set the desired namespace.');
      }
      fileGenerator = new CSharpFileGenerator(defaultConfig);
      fileOptions = {
        namespace
      };
      break;
    case Languages.golang:
      if (packageName === undefined) {
        throw new Error('In order to generate models to Go, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new GoFileGenerator(defaultConfig);
      fileOptions = {
        packageName
      };
      break;
    case Languages.java:
      if (packageName === undefined) {
        throw new Error('In order to generate models to Java, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new JavaFileGenerator(defaultConfig);
      fileOptions = {
        packageName
      };
      break;
    case Languages.javascript:
      fileGenerator = new JavaScriptFileGenerator(defaultConfig);
      break;
    case Languages.dart:
      if (packageName === undefined) {
        throw new Error('In order to generate models to Dart, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new DartFileGenerator(defaultConfig);
      fileOptions = {
        packageName
      };
      break;
    default:
      throw new Error(`Could not determine generator for language ${language}, are you using one of the following values ${possibleLanguageValues}?`);
    }
    let models;
    if (output) {
      models = await fileGenerator.generateToFiles(
        parsedInput as any,
        output,
        { ...fileOptions, } as any);
      const generatedModels = models.map((model) => { return model.modelName; });

      this.log(`Successfully generated the following models: ${generatedModels.join(', ')}`);
    } else {
      models = await fileGenerator.generateCompleteModels(
        parsedInput as any,
        { ...fileOptions } as any);
      const generatedModels = models.map((model) => {
        return `
## Model name: ${model.modelName}
${model.result}
`;
      });

      this.log(`Successfully generated the following models: ${generatedModels.join('\n')}`);
    }
  }
}
