import { Flags } from '@oclif/core';
import { getDiagnosticSeverity } from '@stoplight/spectral-core';
import { html, json, junit, stylish, teamcity, text, pretty } from '@stoplight/spectral-cli/dist/formatters';
import { OutputFormat } from '@stoplight/spectral-cli/dist/services/config';
import { load, Specification } from '../models/SpecificationFile';
import { specWatcher } from '../globals';
import { parser } from '../parser';
import { watchFlag } from '../flags';
import Command from '../base';

import type { Diagnostic } from '@asyncapi/parser/cjs';

type FormatKind = `${OutputFormat}`;
type SeveritytKind = 'error' | 'warn' | 'info' | 'hint';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag(),
    'fail-severity': Flags.enum({
      description: 'diagnostics of this level or above will trigger a failure exit code',
      options: ['error', 'warn', 'info', 'hint'],
      default: 'error',
    }),
    format: Flags.enum({
      description: 'formatt to use for outputting results',
      options: Object.values(OutputFormat),
      default: OutputFormat.STYLISH,
    })
  }

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ];

  async run() {
    const { args, flags } = await this.parse(Validate); //NOSONAR
    const filePath = args['spec-file'];
    const watchMode = flags.watch;
    const format = flags.format;
    const failSeverity = flags['fail-severity'] as SeveritytKind;

    const specFile = await load(filePath);
    if (watchMode) {
      specWatcher({ spec: specFile, handler: this, handlerName: 'validate' });
    }
    
    await this.validate(specFile, format, failSeverity);
  }

  private async validate(specFile: Specification, format: FormatKind, failSeverity: SeveritytKind) {
    const diagnostics = await parser.validate(specFile.text(), { source: specFile.getSource() });
    if (diagnostics.length) {
      this.log(`\n${specFile.toString()} and/or referenced documents have governance issues.`);
      this.log(this.formatOutput(diagnostics, format, failSeverity));
      if (this.hasFailSeverity(diagnostics, failSeverity)) {
        process.exit(1);
      }
    } else {
      this.log(`\n${specFile.toString()} successfully validated.`);
    }
  }

  private formatOutput(diagnostics: Diagnostic[], format: FormatKind, failSeverity: SeveritytKind) {
    const options = { failSeverity: getDiagnosticSeverity(failSeverity) };
    switch(format) {
      case 'json': return json(diagnostics, options);
      case 'junit': return junit(diagnostics, options);
      case 'html': return html(diagnostics, options);
      case 'text': return text(diagnostics, options);
      case 'teamcity': return teamcity(diagnostics, options);
      case 'pretty': return pretty(diagnostics, options);
      default: return stylish(diagnostics, options);
    }
  }

  private hasFailSeverity(diagnostics: Diagnostic[], failSeverity: SeveritytKind) {
    const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
    return diagnostics.some(diagnostic => diagnostic.severity <= diagnosticSeverity);
  }
}
