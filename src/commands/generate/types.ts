import { CSharpFileGenerator, JavaFileGenerator, JavaScriptFileGenerator, TypeScriptFileGenerator, GoFileGenerator, Logger, DartFileGenerator} from '@asyncapi/modelina';
import { Flags } from '@oclif/core';
import Command from '../../base';
import { load } from '../../models/SpecificationFile';
import { parse } from '@asyncapi/parser';
enum Languages {
  typescript = 'typescript',
  csharp = 'csharp',
  golang = 'golang',
  java = 'java',
  javascript = 'javascript',
  dart = 'dart'
}
export default class Types extends Command {
  static description = 'Generates typed models';

  static args = [
    { 
      name: 'language', 
      description: 'language output', 
      options: Object.keys(Languages), 
      required: true 
    },
    { name: 'file', description: 'spec path, url, or context-name', required: true },
  ]

  static flags = {
    help: Flags.help({ char: 'h' }),
    output: Flags.string({ char: 'o', description: 'output path to write the model to' }),
    /**
     * Go and Java specific package name to use for the generated types
     */
    packageName: Flags.string({ description: 'Go and Java specific, define the package to use for the generated types', required: false }),
    /**
     * C# specific options
     */
    namespace: Flags.string({ description: 'C# specific, define the namespace to use for the generated types', required: false }),
  }

  async run() {
    const passedArguments = await this.parse(Types);
    const { namespace, packageName, output } = passedArguments.flags;
    const { language, file } = passedArguments.args;
    const inputFile = await load(file) || await load();
    const parsedInput = await parse(inputFile.text());
    Logger.setLogger({
      info: this.log,
      debug: this.debug,
      warn: this.warn,
      error: this.error,
    });
    let fileGenerator;
    let fileOptions = {};
    switch (language) {
    case Languages.typescript:
      fileGenerator = new TypeScriptFileGenerator();
      break;
    case Languages.csharp:
      if (namespace === undefined) {
        throw new Error('In order to generate types to C#, we need to know which namespace they are under. Add `--namespace=NAMESPACE` to set the desired namespace.');
      }
      fileGenerator = new CSharpFileGenerator();
      fileOptions = {
        namespace
      };
      break;
    case Languages.golang:
      if (packageName === undefined) {
        throw new Error('In order to generate types to Go, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new GoFileGenerator();
      fileOptions = {
        packageName
      };
      break;
    case Languages.java:
      if (packageName === undefined) {
        throw new Error('In order to generate types to Java, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
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
        throw new Error('In order to generate types to Dart, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new DartFileGenerator();
      fileOptions = {
        packageName
      };
      break;
    default:
      throw new Error(`Could not determine generator for language ${language}`);
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
