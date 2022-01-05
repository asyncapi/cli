import { CSharpFileGenerator, JavaFileGenerator, JavaScriptFileGenerator } from '@asyncapi/modelina';
import { flags } from '@oclif/command';
import Command from '../base';
import { load } from '../models/SpecificationFile';
import { parse } from '@asyncapi/parser';
export default class GenerateTypes extends Command {
  static description = 'Generates typed models';

  static flags = {
    help: flags.help({ char: 'h' }),
    file: flags.string({ char: 'f', description: 'path to the AsyncAPI file to generate types for' }),
    outputDirectory: flags.string({ char: 'o', description: 'output path to write the types to', required: true}),
    language: flags.enum({ char: 'l', description: 'language output', options: ['typescript', 'csharp', 'golang', 'java', 'javascript'], required: true}),
    /**
     * Go specific options
     */
    goPackageName: flags.string({description: 'Go specific, define the package to use for the generated types', required: false}),
    /**
     * Java specific options
     */
    javaPackageName: flags.string({description: 'Java specific, define the package to use for the generated types', required: false}),
    /**
     * C# specific options
     */
    csharpNamespace: flags.string({description: 'C# specific, define the namespace to use for the generated types', required: false}),
  }

  static args = []

  async run() {
    const { flags } = this.parse(GenerateTypes);
    const outputDirectory = flags.outputDirectory;
    const file = await load(flags.file) || await load();
    const parsedInput = await parse(await file.read());
    const language = flags.language;
    let fileGenerator;
    let fileOptions = {};
    if (language === 'typescript') {
      //fileGenerator = new TypeScriptFileGenerator();
    } else if (language === 'javascript') {
      fileGenerator = new JavaScriptFileGenerator();
    } else if (language === 'csharp') {
      if (flags.csharpNamespace === undefined) {
        throw new Error('Missing namespace option. Add `--csharpNamespace NAMESPACE` to set the desired namespace.');
      }
      fileGenerator = new CSharpFileGenerator();
      const namespace = flags.csharpNamespace;
      fileOptions = {
        namespace
      };
    } else if (language === 'golang') {
      if (flags.goPackageName === undefined) {
        throw new Error('Missing package name option. Add `--goPackageName PACKAGENAME` to set the desired package name.');
      }
      const packageName = flags.goPackageName;
      //fileGenerator = new GoFileGenerator();
      fileOptions = {
        packageName
      };
    } else if (language === 'java') {
      if (flags.javaPackageName === undefined) {
        throw new Error('Missing package name option. Add `--javaPackageName PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new JavaFileGenerator();
      const packageName = flags.javaPackageName;
      fileOptions = {
        packageName
      };
    }
    if (fileGenerator === undefined) {
      throw new Error(`Could not determine generator for language ${language}`);
    }
    await fileGenerator.generateToFiles(
      parsedInput as any, 
      outputDirectory, 
      fileOptions as any);
  }
}
