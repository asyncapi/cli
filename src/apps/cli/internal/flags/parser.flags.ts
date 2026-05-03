import { Flags } from '@oclif/core';

export interface ValidationFlagsOptions {
  logDiagnostics?: boolean;
}

export function parserFlags({
  logDiagnostics = true,
}: ValidationFlagsOptions = {}) {
  return {
    'log-diagnostics': Flags.boolean({
      description: 'log validation diagnostics or not',
      default: logDiagnostics,
      allowNo: true,
    }),
    'diagnostics-format': Flags.option({
      description: 'format to use for validation diagnostics',
      options: ['stylish', 'json', 'junit', 'html', 'text', 'teamcity', 'pretty'] as const,
      default: 'stylish',
    })(),
    'fail-severity': Flags.option({
      description:
        'diagnostics of this level or above will trigger a failure exit code',
      options: ['error', 'warn', 'info', 'hint'] as const,
      default: 'error',
    })(),
    'save-output': Flags.string({
      description:
        'The output file name. Omitting this flag the result will be printed in the console.',
      char: 's',
    }),
  };
}
