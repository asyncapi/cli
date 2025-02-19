// import { AvroSchemaParser } from '@asyncapi/avro-schema-parser';
// import { OpenAPISchemaParser } from '@asyncapi/openapi-schema-parser';
// import { RamlDTSchemaParser } from '@asyncapi/raml-dt-schema-parser';
import { Flags } from '@oclif/core';
// import { ProtoBuffSchemaParser } from '@asyncapi/protobuf-schema-parser';
import { OutputFormat } from '../spectral_replacement';
// import type Command from './base';
// import type { Specification } from './models/SpecificationFile';

// type DiagnosticsFormat = 'stylish' | 'json' | 'junit' | 'html' | 'text' | 'teamcity' | 'pretty';

// export type SeverityKind = 'error' | 'warn' | 'info' | 'hint';

// export { convertToOldAPI };

// // const { writeFile } = promises;

// // const formatExtensions: Record<DiagnosticsFormat, string> = {
// //   stylish: '.txt',
// //   json: '.json',
// //   junit: '.xml',
// //   html: '.html',
// //   text: '.txt',
// //   teamcity: '.txt',
// //   pretty: '.txt',
// // };

// // const validFormats = ['stylish', 'json', 'junit', 'html', 'text', 'teamcity', 'pretty'];

// const parser = new Parser({
//   __unstable: {
//     resolver: {
//       cache: false,
//     }
//   }
// });

// parser.registerSchemaParser(AvroSchemaParser());
// parser.registerSchemaParser(OpenAPISchemaParser());
// parser.registerSchemaParser(RamlDTSchemaParser());
// parser.registerSchemaParser(ProtoBuffSchemaParser());

export interface ValidationFlagsOptions {
  logDiagnostics?: boolean;
}

// export enum ValidationStatus {
//   INVALID = 'invalid',
//   VALID = 'valid',
// }

export function validationFlags({ logDiagnostics = true }: ValidationFlagsOptions = {}) {
  return {
    'log-diagnostics': Flags.boolean({
      description: 'log validation diagnostics or not',
      default: logDiagnostics,
      allowNo: true,
    }),
    'diagnostics-format': Flags.option({
      description: 'format to use for validation diagnostics',
      options: Object.values(OutputFormat),
      default: OutputFormat.STYLISH,
    })(),
    'fail-severity': Flags.option({
      description: 'diagnostics of this level or above will trigger a failure exit code',
      options: ['error', 'warn', 'info', 'hint'] as const,
      default: 'error',
    })(),
    output: Flags.string({
      description: 'The output file name. Omitting this flag the result will be printed in the console.',
      char: 'o' 
    })
  };
}

// export interface ValidateOptions {
//   'log-diagnostics'?: boolean;
//   'diagnostics-format'?: `${OutputFormat}`;
//   'fail-severity'?: SeverityKind;
//   'output'?: string;
// }

// export async function validate(command: Command, specFile: Specification, options: ValidateOptions = {}) {
//   const diagnostics = await parser.validate(specFile.text(), { source: specFile.getSource() });
//   return logDiagnostics(diagnostics, command, specFile, options);
// }

// export async function parse(command: Command, specFile: Specification, options: ValidateOptions = {}) {
//   const { document, diagnostics } = await parser.parse(specFile.text(), { source: specFile.getSource() });
//   const status = logDiagnostics(diagnostics, command, specFile, options);
//   return { document, diagnostics, status };
// }

// function logDiagnostics(
//   diagnostics: Diagnostic[],
//   command: Command,
//   specFile: Specification,
//   options: ValidateOptions = {}
// ): 'valid' | 'invalid' {
//   const logDiagnostics = options['log-diagnostics'];
//   const failSeverity = options['fail-severity'] ?? 'error';
//   const diagnosticsFormat = options['diagnostics-format'] ?? 'stylish';
//   const sourceString = specFile.toSourceString();

//   const hasIssues = diagnostics.length > 0;
//   const isFailSeverity = hasIssues;

//   if (logDiagnostics) {
//     logGovernanceMessage(command, sourceString, hasIssues, isFailSeverity);
//     outputDiagnostics(command, diagnostics, diagnosticsFormat, failSeverity, options);
//   }

//   return isFailSeverity ? ValidationStatus.INVALID : ValidationStatus.VALID;
// }

// function logGovernanceMessage(
//   command: Command,
//   sourceString: string,
//   hasIssues: boolean,
//   isFailSeverity: boolean
// ) {
//   if (!hasIssues) {
//     command.log(`\n${sourceString} is valid! ${sourceString} and referenced documents don't have governance issues.`);
//   } else if (isFailSeverity) {
//     command.logToStderr(`\n${sourceString} and/or referenced documents have governance issues.`);
//   } else {
//     command.log(`\n${sourceString} is valid but has (itself and/or referenced documents) governance issues.`);
//   }
// }

// function outputDiagnostics(
//   command: Command,
//   diagnostics: Diagnostic[],
//   diagnosticsFormat: DiagnosticsFormat,
//   failSeverity: SeverityKind,
//   options: ValidateOptions
// ) {
//   //const diagnosticsOutput = formatOutput(diagnostics, diagnosticsFormat, failSeverity);
//   if (options.output) {
//     console.log(options.output, command, diagnosticsFormat);
//   } else {
//   // command.log(diagnosticsOutput);
//   }
// }

// // function formatStylish(diagnostics: Diagnostic[], options: { failSeverity: DiagnosticSeverity }) {
// //   const groupedDiagnostics = diagnostics.reduce((acc, diagnostic) => {
// //     const severity = diagnostic.severity;
// //     if (!acc[severity as DiagnosticSeverity]) {
// //       acc[severity as DiagnosticSeverity] = [];
// //     }
// //     acc[severity as DiagnosticSeverity].push(diagnostic);
// //     return acc;
// //   }, {} as Record<DiagnosticSeverity, Diagnostic[]>);

// //   return Object.entries(groupedDiagnostics).map(([severity, diagnostics]) => {
// //     return `${getSeverityTitle(Number(severity))} ${stylish(diagnostics, options)}`;
// //   }).join('\n');
// // }

// // function getSeverityTitle(severity: DiagnosticSeverity) {
// //   switch (severity) {
// //   case DiagnosticSeverity.Error: return red('Errors');
// //   case DiagnosticSeverity.Warning: return yellow('Warnings');
// //   case DiagnosticSeverity.Information: return cyan('Information');
// //   case DiagnosticSeverity.Hint: return green('Hints');
// //   }
// // }

// // function hasFailSeverity(diagnostics: Diagnostic[], failSeverity: SeverityKind) {
// //   const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
// //   return diagnostics.some(diagnostic => diagnostic.severity <= diagnosticSeverity);
// // }

// // async function writeValidationDiagnostic(outputPath: string, command: Command, format: DiagnosticsFormat, formatOutput: string) {
// //   if (!validFormats.includes(format)) {
// //     command.logToStderr(`Invalid diagnostics format: "${format}"`);
// //     return;
// //   }

// //   const expectedExtension = formatExtensions[format as keyof typeof formatExtensions];
// //   const actualExtension = path.extname(outputPath);

// //   // Validate file extension against diagnostics format
// //   if (expectedExtension && (actualExtension !== expectedExtension)) {
// //     command.logToStderr(`Invalid file extension for format "${format}". Expected extension: "${expectedExtension}"`);
// //   } else {
// //     await writeFile(path.resolve(process.cwd(), outputPath), formatOutput, {
// //       encoding: 'utf-8',
// //     }).catch(err => console.log(err));
// //   }
// // }
