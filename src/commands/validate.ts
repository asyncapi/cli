import { Flags } from '@oclif/core';

import Command from '../base';
import { validate, validationFlags } from '../parser';
import { load } from '../models/SpecificationFile';
import { specWatcher } from '../globals';
import { watchFlag } from '../flags';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag(),
    ...validationFlags(),
  }

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ];

  async run() {
    const { args, flags } = await this.parse(Validate); //NOSONAR
    const filePath = args['spec-file'];
    const watchMode = flags.watch;

    const specFile = await load(filePath);
    if (watchMode) {
      specWatcher({ spec: specFile, handler: this, handlerName: 'validate' });
    }
    
    await validate(this, specFile, flags);
  }

  // private async validate(specFile: Specification, format: `${OutputFormat}`, failSeverity: SeveritytKind) {
  //   const diagnostics = await parser.validate(specFile.text(), { source: specFile.getSource() });
  //   if (diagnostics.length) {
  //     if (this.hasFailSeverity(diagnostics, failSeverity)) {
  //       this.logToStderr(`\n${specFile.toDetails()} and/or referenced documents have governance issues.\n`);
  //       this.logToStderr(this.formatOutput(diagnostics, format, failSeverity));
  //       this.exit(1);
  //     } else {
  //       this.log(`\n${specFile.toDetails()} and/or referenced documents have governance issues.\n`);
  //       this.log(this.formatOutput(diagnostics, format, failSeverity));
  //     }
  //   } else {
  //     this.log(`\n${specFile.toDetails()} successfully validated! ${specFile.toDetails()} and referenced documents don't have governance issues.`);
  //   }
  // }

  // private formatOutput(diagnostics: Diagnostic[], format: `${OutputFormat}`, failSeverity: SeveritytKind) {
  //   const options = { failSeverity: getDiagnosticSeverity(failSeverity) };
  //   switch(format) {
  //     case 'stylish': return stylish(diagnostics, options);
  //     case 'json': return json(diagnostics, options);
  //     case 'junit': return junit(diagnostics, options);
  //     case 'html': return html(diagnostics, options);
  //     case 'text': return text(diagnostics, options);
  //     case 'teamcity': return teamcity(diagnostics, options);
  //     case 'pretty': return pretty(diagnostics, options);
  //     default: return stylish(diagnostics, options);
  //   }
  // }

  // private hasFailSeverity(diagnostics: Diagnostic[], failSeverity: SeveritytKind) {
  //   const diagnosticSeverity = getDiagnosticSeverity(failSeverity);
  //   return diagnostics.some(diagnostic => diagnostic.severity <= diagnosticSeverity);
  // }
}
