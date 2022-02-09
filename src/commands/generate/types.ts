import { CSharpFileGenerator, JavaFileGenerator, JavaScriptFileGenerator, TypeScriptFileGenerator, GoFileGenerator, Logger} from '@asyncapi/modelina';
import { flags } from '@oclif/command';
import Command from '../../base';
import { load } from '../../models/SpecificationFile';
import { parse } from '@asyncapi/parser';
export default class Types extends Command {
  static description = 'Generates typed models';

  static args = [
    {name: 'language', description: 'language output', options: ['typescript', 'csharp', 'golang', 'java', 'javascript']},
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    file: flags.string({ char: 'f', description: 'path to the AsyncAPI file to generate types for' }),
    output: flags.string({ char: 'o', description: 'output path to write the types to', required: true}),
    /**
     * Go and Java specific package name to use for the generated types
     */
    packageName: flags.string({description: 'Go and Java specific, define the package to use for the generated types', required: false}),
    /**
     * C# specific options
     */
    namespace: flags.string({description: 'C# specific, define the namespace to use for the generated types', required: false}),
  }

  async run() {
    const passedArguments = this.parse(Types);
    const flags = passedArguments.flags;
    const { language } = passedArguments.args;

    const outputDirectory = flags.output;
    const file = await load(flags.file) || await load();
    const parsedInput = await parse(file.text());
    let fileGenerator;
    let fileOptions = {};
    switch (language) {
    case 'typescript':
      fileGenerator = new TypeScriptFileGenerator();
      break;
    case 'csharp':
      if (flags.namespace === undefined) {
        throw new Error('In order to generate types to C#, we need to know which namespace they are under. Add `--namespace=NAMESPACE` to set the desired namespace.');
      }
      fileGenerator = new CSharpFileGenerator();
      fileOptions = {
        namespace: flags.namespace
      };
      break;
    case 'golang':
      if (flags.packageName === undefined) {
        throw new Error('In order to generate types to Go, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new GoFileGenerator();
      fileOptions = {
        packageName: flags.packageName
      };
      break;
    case 'java':
      if (flags.packageName === undefined) {
        throw new Error('In order to generate types to Java, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new JavaFileGenerator();
      fileOptions = {
        packageName: flags.packageName
      };
      break;
    case 'javascript':
      fileGenerator = new JavaScriptFileGenerator();
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

    this.log(`Successfully generated the following models ${generatedModelNames.join(', ')}`);
  }
}
