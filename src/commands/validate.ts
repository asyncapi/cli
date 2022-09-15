import { Flags } from '@oclif/core';
import { getDiagnosticSeverity } from '@stoplight/spectral-core';
import { html, json, junit, stylish, teamcity, text, pretty } from '@stoplight/spectral-cli/dist/formatters';
import { OutputFormat } from '@stoplight/spectral-cli/dist/services/config';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';
import { specWatcher } from '../globals';
import { parser } from '../parser';
import { watchFlag } from '../flags';

import type { Diagnostic } from '@asyncapi/parser/cjs';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag,
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
    const watchMode = flags['watch'];
    const format = flags.format;
    const failSeverity = flags['fail-severity'] as 'error' | 'warn' | 'info' | 'hint';

    const specFile = await load(filePath);
    if (watchMode) {
      specWatcher({ spec: specFile, handler: this, handlerName: 'validate' });
    }
    
    try {  
      if (specFile.getFilePath()) {
        const diagnostics = await parser.validate(specFile.text(), { source: specFile.getFilePath() });
        if (diagnostics.length) {
          this.log(this.formatOutput(diagnostics, format, failSeverity));
        } else {
          this.log(`File ${specFile.getFilePath()} successfully validated!`);
        }
      } else if (specFile.getFileURL()) {
        const diagnostics = await parser.validate(specFile.text(), { source: specFile.getFileURL() });
        if (diagnostics.length) {
          this.log(this.formatOutput(diagnostics, format, failSeverity));
        } else {
          this.log(`URL ${specFile.getFileURL()} successfully validated`);
        }
      }
    } catch (error) {
      throw new ValidationError({
        type: 'parser-error',
        err: error
      });
    }
  }

  private formatOutput(diagnostics: Diagnostic[], format: 'json' | 'stylish' | 'junit' | 'html' | 'text' | 'teamcity' | 'pretty', failSeverity: 'error' | 'warn' | 'info' | 'hint') {
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
}
