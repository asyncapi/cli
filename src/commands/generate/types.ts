import { CSharpFileGenerator, JavaFileGenerator, JavaScriptFileGenerator, TypeScriptFileGenerator, GoFileGenerator, Logger} from '@asyncapi/modelina';
import { flags } from '@oclif/command';
import Command from '../../base';
import { load } from '../../models/SpecificationFile';
import { parse } from '@asyncapi/parser';
export default class Types extends Command {
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

  async run() {
    const passedArguments = this.parse(Types);
    const args = passedArguments.flags;
    const outputDirectory = args.outputDirectory;
    const file = await load(args.file) || await load();
    const parsedInput = await parse(file.text());
    const language = args.language;
    let fileGenerator;
    let fileOptions = {};
    switch (language) {
    case 'typescript':
      fileGenerator = new TypeScriptFileGenerator();
      break;
    case 'javascript':
      fileGenerator = new JavaScriptFileGenerator();
      break;
    case 'csharp':
      if (args.csharpNamespace === undefined) {
        throw new Error('Missing namespace option. Add `--csharpNamespace=NAMESPACE` to set the desired namespace.');
      }
      fileGenerator = new CSharpFileGenerator();
      fileOptions = {
        namespace: args.csharpNamespace
      };
      break;
    case 'golang':
      if (args.goPackageName === undefined) {
        throw new Error('Missing package name option. Add `--goPackageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new GoFileGenerator();
      fileOptions = {
        packageName: args.goPackageName
      };
      break;
    case 'java':
      if (args.javaPackageName === undefined) {
        throw new Error('Missing package name option. Add `--javaPackageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new JavaFileGenerator();
      fileOptions = {
        packageName: args.javaPackageName
      };
      break;
    default:
      throw new Error(`Could not determine generator for language ${language}`);
    }
    Logger.setLogger({
      info: this.log,
      debug: this.debug,
      warn: this.warn,
      error: this.error,
    });
    const models = await fileGenerator.generateToFiles(
      parsedInput as any, 
      outputDirectory, 
      {...fileOptions, } as any);
    const generatedModelNames = models.map((model) => {return model.modelName;});

    this.log(`We successfully generated the following models ${generatedModelNames.join(', ')}`);
  }
}
