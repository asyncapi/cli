import { CSHARP_COMMON_PRESET, CSHARP_DEFAULT_PRESET, CSHARP_JSON_SERIALIZER_PRESET, CSHARP_NEWTONSOFT_SERIALIZER_PRESET, CSharpFileGenerator, CplusplusFileGenerator, DartFileGenerator, GoFileGenerator, JAVA_COMMON_PRESET, JAVA_CONSTRAINTS_PRESET, JAVA_DESCRIPTION_PRESET, JAVA_JACKSON_PRESET, JavaFileGenerator, JavaScriptFileGenerator, KotlinFileGenerator, Logger, PhpFileGenerator, PythonFileGenerator, RustFileGenerator, TS_COMMON_PRESET, TS_DESCRIPTION_PRESET, TS_JSONBINPACK_PRESET, TypeScriptFileGenerator } from '@asyncapi/modelina';
import { Args } from '@oclif/core';
import { ConvertDocumentParserAPIVersion } from '@smoya/multi-parser';
import Command from '../../core/base';
import { load } from '../../core/models/SpecificationFile';
import { ValidateOptions, formatOutput, parse } from '../../core/parser';

import { cancel, intro, isCancel, select, spinner, text } from '@clack/prompts';
import { green, inverse } from 'picocolors';

import type { AbstractFileGenerator, AbstractGenerator } from '@asyncapi/modelina';
import { modelsFlags } from 'core/flags/generate/models.flags';

enum Languages {
  typescript = 'typescript',
  csharp = 'csharp',
  golang = 'golang',
  java = 'java',
  javascript = 'javascript',
  dart = 'dart',
  python = 'python',
  rust = 'rust',
  kotlin='kotlin',
  php='php',
  cplusplus='cplusplus'
}
const possibleLanguageValues = Object.values(Languages).join(', ');

export default class Models extends Command {
  static description = 'Generates typed models';

  static args = {
    language: Args.string({description: 'The language you want the typed models generated for.', options: Object.keys(Languages), required: true}),
    file: Args.string({description: 'Path or URL to the AsyncAPI document, or context-name', required: true}),
  };

  static flags = modelsFlags();

  /* eslint-disable sonarjs/cognitive-complexity */
  async run() {
    const { args, flags } = await this.parse(Models);

    const { tsModelType, tsEnumType, tsIncludeComments, tsModuleSystem, tsExportType, tsJsonBinPack, tsMarshalling, tsExampleInstance, tsRawPropertyNames, namespace, csharpAutoImplement, csharpArrayType, csharpNewtonsoft, csharpHashcode, csharpEqual, csharpSystemJson, packageName, javaIncludeComments, javaJackson, javaConstraints } = flags;
    let { language, file } = args;
    let output = flags.output || 'stdout';
    const interactive = !flags['no-interactive'];

    if (!interactive) {
      intro(inverse('AsyncAPI Generate Models'));

      const parsedArgs = await this.parseArgs(args, output);
      language = parsedArgs.language;
      file = parsedArgs.file;
      output = parsedArgs.output;
    }

    const inputFile = (await load(file)) || (await load());
    if (inputFile.isAsyncAPI3()) {
      this.error('Generate Models command does not support AsyncAPI v3 yet, please checkout https://github.com/asyncapi/modelina/issues/1376');
    }
    const { document, diagnostics ,status } = await parse(this, inputFile, flags as ValidateOptions);
    if (!document || status === 'invalid') {
      const severityErrors = diagnostics.filter((obj) => obj.severity === 0);
      this.log(`Input is not a correct AsyncAPI document so it cannot be processed.${formatOutput(severityErrors,'stylish','error')}`);
      return;
    }

    // Modelina, atm, is not using @asyncapi/parser@v3.x but @asyncapi/parser@v2.x, so it still uses Parser-API v1.0.0.
    // This call converts the parsed document object using @asyncapi/parser@v3.x (Parser-API v2) to a document compatible with the Parser-API version in use in @asyncapi/parser@v2.x  (v1)
    // This is needed until https://github.com/asyncapi/modelina/issues/1493 gets fixed.
    const convertedDoc = ConvertDocumentParserAPIVersion(document.json(), 1);

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

    let fileGenerator: AbstractGenerator<any, any> & AbstractFileGenerator<any>;
    let fileOptions: any = {};
    const presets = [];
    const options = {
      marshalling: tsMarshalling,
      example: tsExampleInstance,
    };
    switch (language) {
    case Languages.typescript:
      presets.push({
        preset: TS_COMMON_PRESET,
        options
      });
      if (tsIncludeComments) {presets.push(TS_DESCRIPTION_PRESET);}
      if (tsJsonBinPack) {
        presets.push({
          preset: TS_COMMON_PRESET,
          options
        },
        TS_JSONBINPACK_PRESET);
      }
      fileGenerator = new TypeScriptFileGenerator({
        modelType: tsModelType as 'class' | 'interface',
        enumType: tsEnumType as 'enum' | 'union',
        rawPropertyNames: tsRawPropertyNames,
        presets
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

      if (csharpAutoImplement) {
        presets.push({
          preset: CSHARP_DEFAULT_PRESET,
          options: {
            autoImplementedProperties: true
          }
        });
      }
      if (csharpNewtonsoft) {
        presets.push(CSHARP_NEWTONSOFT_SERIALIZER_PRESET);
      }
      if (csharpSystemJson) {
        presets.push(CSHARP_JSON_SERIALIZER_PRESET);
      }
      if (csharpHashcode || csharpEqual) {
        presets.push({
          preset: CSHARP_COMMON_PRESET,
          options: {
            hashCode: csharpHashcode,
            equals: csharpEqual
          }
        });
      }

      fileGenerator = new CSharpFileGenerator({
        presets,
        collectionType: csharpArrayType as 'Array' | 'List'
      });

      fileOptions = {
        namespace
      };
      break;
    case Languages.cplusplus:
      if (namespace === undefined) {
        throw new Error('In order to generate models to C++, we need to know which namespace they are under. Add `--namespace=NAMESPACE` to set the desired namespace.');
      }
      fileGenerator = new CplusplusFileGenerator({
        namespace
      });
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
      presets.push({
        preset: JAVA_COMMON_PRESET,
        options
      });
      if (javaIncludeComments) {presets.push(JAVA_DESCRIPTION_PRESET);}
      if (javaJackson) {presets.push(JAVA_JACKSON_PRESET);}
      if (javaConstraints) {presets.push(JAVA_CONSTRAINTS_PRESET);}
      fileGenerator = new JavaFileGenerator({ presets });
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
    case Languages.kotlin:
      if (packageName === undefined) {
        throw new Error('In order to generate models to Kotlin, we need to know which package they are under. Add `--packageName=PACKAGENAME` to set the desired package name.');
      }
      fileGenerator = new KotlinFileGenerator();
      fileOptions = {
        packageName
      };
      break;
    case Languages.php:
      if (namespace === undefined) {
        throw new Error('In order to generate models to PHP, we need to know which namespace they are under. Add `--namespace=NAMESPACE` to set the desired namespace.');
      }
      fileGenerator = new PhpFileGenerator();
      fileOptions = {
        namespace
      };
      break;
    default:
      throw new Error(`Could not determine generator for language ${language}, are you using one of the following values ${possibleLanguageValues}?`);
    }

    const s = spinner();
    s.start('Generating models...');
    if (output !== 'stdout') {
      const models = await fileGenerator.generateToFiles(
        convertedDoc as any,
        output,
        { ...fileOptions, });
      const generatedModels = models.map((model) => { return model.modelName; });
      s.stop(green(`Successfully generated the following models: ${generatedModels.join(', ')}`));
      return;
    }

    const models = await fileGenerator.generateCompleteModels(
      convertedDoc as any,
      { ...fileOptions });
    const generatedModels = models.map((model) => {
      return `
        ## Model name: ${model.modelName}
        ${model.result}
      `;
    });
    s.stop(green(`Successfully generated the following models: ${generatedModels.join('\n')}`));
  }

  private async parseArgs(args: Record<string, any>, output?: string) {
    let { language, file } = args;
    let askForOutput = false;
    const operationCancelled = 'Operation cancelled by the user.';
    if (!language) {
      language = await select({
        message: 'Select the language you want to generate models for',
        options: Object.keys(Languages).map((key) =>
          ({ value: key, label: key, hint: Languages[key as keyof typeof Languages] })
        ),
      });

      askForOutput = true;
    }

    if (isCancel(language)) {
      cancel(operationCancelled);
      this.exit();
    }

    if (!file) {
      file = await text({
        message: 'Enter the path or URL to the AsyncAPI document',
        defaultValue: 'asyncapi.yaml',
        placeholder: 'asyncapi.yaml',
      });

      askForOutput = true;
    }

    if (isCancel(file)) {
      cancel(operationCancelled);
      this.exit();
    }

    if (!output && askForOutput) {
      output = await text({
        message: 'Enter the output directory or stdout to write the models to',
        defaultValue: 'stdout',
        placeholder: 'stdout',
      }) as string;
    }

    if (isCancel(output)) {
      cancel(operationCancelled);
      this.exit();
    }

    return { language, file, output: output || 'stdout' };
  }
}
