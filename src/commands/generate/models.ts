import { convertToOldAPI } from '@asyncapi/parser/cjs';
import { CSharpFileGenerator, JavaFileGenerator, JavaScriptFileGenerator, TypeScriptFileGenerator, GoFileGenerator, Logger, DartFileGenerator} from '@asyncapi/modelina';
import { Flags } from '@oclif/core';
import Command from '../../base';
import { load } from '../../models/SpecificationFile';

import { validationFlags, parse } from '../../parser';

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
    { name: 'file', description: 'Path or URL to the AsyncAPI document, or context-name', required: false },
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({
      char: 'o',
      description: 'The output directory where the models should be written to. Omitting this flag will write the models to `stdout`.',
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
    namespace: Flags.string({ description: 'C# specific, define the namespace to use for the generated models. This is required when language is `csharp`.', required: false }),
    ...validationFlags(),
  };

  async run() {
    const { flags, args } = await this.parse(Models);
    const { namespace, packageName, output } = flags;
    const { language, file } = args;

    const inputFile = await load(file);
    const { document, status } = await parse(this, inputFile, flags);

    if (!document || status === 'invalid') {
      return;
    }
    const parsedDocument = convertToOldAPI(document);

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
        modelType: tsModelType as undefined | 'class' | 'interface',
        enumType: tsEnumType as undefined | 'enum' | 'union'
      });
      fileOptions = {
        moduleSystem: tsModuleSystem,
        exportType: tsExportType
      };
      break;
    case Languages.python:
      fileGenerator = new PythonFileGenerator();
      break;
    case Languages.rust:
      fileGenerator = new RustFileGenerator();
      break;
    case Languages.csharp:
      if (namespace === undefined) {
        throw new Error('In order to generate models to C#, we need to know which namespace they are under. Add `--namespace=NAMESPACE` to set the desired namespace.');
      }
      fileGenerator = new CSharpFileGenerator();
      fileOptions = {
        namespace
      };
      break;
    case Languages.golang:
      if (packageName === undefined) {
        throw new Error('In order to generate models to Go, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new GoFileGenerator();
      fileOptions = {
        packageName
      };
      break;
    case Languages.java:
      if (packageName === undefined) {
        throw new Error('In order to generate models to Java, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new JavaFileGenerator();
      fileOptions = {
        packageName
      };
      break;
    case Languages.javascript:
      fileGenerator = new JavaScriptFileGenerator();
      break;
    case Languages.dart:
      if (packageName === undefined) {
        throw new Error('In order to generate models to Dart, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new DartFileGenerator();
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
        parsedDocument as any,
        output,
        { ...fileOptions, } as any);
      const generatedModels = models.map((model) => { return model.modelName; });

      this.log(`Successfully generated the following models: ${generatedModels.join(', ')}`);
    } else {
      models = await fileGenerator.generateCompleteModels(
        parsedDocument as any,
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
