import { Flags } from '@oclif/core';
import { validationFlags } from '../../parser';

export const modelsFlags = () => {
  return {
    help: Flags.help({ char: 'h' }),
    'no-interactive': Flags.boolean({
      description: 'Disable interactive mode and run with the provided flags.',
      required: false,
      default: false,
    }),
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
      default: 'class',
    }),
    tsEnumType: Flags.string({
      type: 'option',
      options: ['enum', 'union'],
      description: 'TypeScript specific, define which type of enums needs to be generated.',
      required: false,
      default: 'enum',
    }),
    tsModuleSystem: Flags.string({
      type: 'option',
      options: ['ESM', 'CJS'],
      description: 'TypeScript specific, define the module system to be used.',
      required: false,
      default: 'ESM',

    }),
    tsIncludeComments: Flags.boolean({
      description: 'TypeScript specific, if enabled add comments while generating models.',
      required: false,
      default: false,
    }),
    tsExportType: Flags.string({
      type: 'option',
      options: ['default', 'named'],
      description: 'TypeScript specific, define which type of export needs to be generated.',
      required: false,
      default: 'default',
    }),
    tsJsonBinPack: Flags.boolean({
      description: 'TypeScript specific, define basic support for serializing to and from binary with jsonbinpack.',
      required: false,
      default: false,
    }),
    tsMarshalling: Flags.boolean({
      description: 'TypeScript specific, generate the models with marshalling functions.',
      required: false,
      default: false,
    }),
    tsExampleInstance: Flags.boolean({
      description: 'Typescript specific, generate example of the model',
      required: false,
      default: false,
    }),
    tsRawPropertyNames: Flags.boolean({
      description: 'Typescript specific, generate the models using raw property names.',
      required: false,
      default: false,
    }),
    /**
     * Go and Java specific package name to use for the generated models
     */
    packageName: Flags.string({
      description: 'Go, Java and Kotlin specific, define the package to use for the generated models. This is required when language is `go`, `java` or `kotlin`.',
      required: false
    }),
    /**
     * Java specific options
     */
    javaIncludeComments: Flags.boolean({
      description: 'Java specific, if enabled add comments while generating models.',
      required: false,
      default: false
    }),
    javaJackson: Flags.boolean({
      description: 'Java specific, generate the models with Jackson serialization support',
      required: false,
      default: false
    }),
    javaConstraints: Flags.boolean({
      description: 'Java specific, generate the models with constraints',
      required: false,
      default: false
    }),

    /**
     * C++ and C# and PHP specific namespace to use for the generated models
     */
    namespace: Flags.string({
      description: 'C#, C++ and PHP specific, define the namespace to use for the generated models. This is required when language is `csharp`,`c++` or `php`.',
      required: false
    }),

    /**
     * C# specific options
     */
    csharpAutoImplement: Flags.boolean({
      description: 'C# specific, define whether to generate auto-implemented properties or not.',
      required: false,
      default: false
    }),
    csharpNewtonsoft: Flags.boolean({
      description: 'C# specific, generate the models with newtonsoft serialization support',
      required: false,
      default: false
    }),
    csharpArrayType: Flags.string({
      type: 'option',
      description: 'C# specific, define which type of array needs to be generated.',
      options: ['Array', 'List'],
      required: false,
      default: 'Array'
    }),
    csharpHashcode: Flags.boolean({
      description: 'C# specific, generate the models with the GetHashCode method overwritten',
      required: false,
      default: false
    }),
    csharpEqual: Flags.boolean({
      description: 'C# specific, generate the models with the Equal method overwritten',
      required: false,
      default: false
    }),
    csharpSystemJson: Flags.boolean({
      description: 'C# specific, generate the models with System.Text.Json serialization support',
      required: false,
      default: false
    }),
    ...validationFlags({ logDiagnostics: false }),
  };
};
