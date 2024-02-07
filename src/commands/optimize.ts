import { Flags } from '@oclif/core';
import { Optimizer, Output, Report, ReportElement } from '@asyncapi/optimizer';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';
import * as inquirer from 'inquirer';
import chalk from 'chalk';
import { promises } from 'fs';
import { Example } from '@oclif/core/lib/interfaces';
import { Parser } from '@asyncapi/parser';

const { writeFile } = promises;

export enum Optimizations {
  REMOVE_COMPONENTS='remove-components',
  REUSE_COMPONENTS='reuse-components',
  MOVE_TO_COMPONENTS='move-to-components'
}

export enum Outputs {
  TERMINAL='terminal',
  NEW_FILE='new-file',
  OVERWRITE='overwrite'
}
export default class Optimize extends Command {
  static description = 'optimize asyncapi specification file';
  isInteractive = false;
  optimizations?: Optimizations[];
  outputMethod?: Outputs;

  static examples: Example[] = [
    'asyncapi optimize ./asyncapi.yaml',
    'asyncapi optimize ./asyncapi.yaml --no-tty',
    'asyncapi optimize ./asyncapi.yaml --optimization=remove-components,reuse-components,move-to-components --no-tty',
    'asyncapi optimize ./asyncapi.yaml --optimization=remove-components,reuse-components,move-to-components --output=terminal --no-tty',
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    optimization: Flags.string({char: 'p', default: Object.values(Optimizations), options: Object.values(Optimizations), multiple: true, description: 'select the type of optimizations that you want to apply.'}),
    output: Flags.string({char: 'o', default: Outputs.TERMINAL, options: Object.values(Outputs), description: 'select where you want the output.'}),
    'no-tty': Flags.boolean({ description: 'do not use an interactive terminal', default: false }),
  };

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ];

  parser = new Parser();

  async run() {
    const { args, flags } = await this.parse(Optimize); //NOSONAR
    const filePath = args['spec-file'];

    try {
      this.specFile = await load(filePath);
    } catch (err) {
      this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: filePath,
        })
      );
    }

    if (this.specFile.isAsyncAPI3()) {
      this.error('Optimize command does not support AsyncAPI v3 yet, please checkout https://github.com/asyncapi/optimizer/issues/168');
    }

    let optimizer: Optimizer;
    let report: Report;
    try {
      optimizer = new Optimizer(this.specFile.text());
      report = await optimizer.getReport();
    } catch (err) {
      this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: filePath,
        })
      );
    }
    this.isInteractive = !flags['no-tty'];
    this.optimizations = flags.optimization as Optimizations[];
    this.outputMethod = flags.output as Outputs;

    this.metricsMetadata.optimized = true;

    if (!(report.moveToComponents?.length || report.removeComponents?.length || report.reuseComponents?.length)) {
      this.log(`No optimization has been applied since ${this.specFile.getFilePath() ?? this.specFile.getFileURL()} looks optimized!`);
      this.metricsMetadata.optimized = false;
      return;
    }
    
    const isTTY = process.stdout.isTTY;
    if (this.isInteractive && isTTY) {
      await this.interactiveRun(report);
    }

    try {
      if (this.isInteractive) {
        return;
      }

      const optimizedDocument = optimizer.getOptimizedDocument({rules: {
        moveToComponents: this.optimizations.includes(Optimizations.MOVE_TO_COMPONENTS),
        removeComponents: this.optimizations.includes(Optimizations.REMOVE_COMPONENTS),
        reuseComponents: this.optimizations.includes(Optimizations.REUSE_COMPONENTS)
      }, output: Output.YAML});

      this.collectMetricsData(report);

      const specPath = this.specFile.getFilePath();
      let newPath = '';

      if (specPath) {
        const pos = specPath.lastIndexOf('.');
        newPath = `${specPath.substring(0,pos) }_optimized.${ specPath.substring(pos+1)}`;
      } else {
        newPath = 'optimized-asyncapi.yaml';
      }

      if (this.outputMethod === Outputs.TERMINAL) {
        this.log(optimizedDocument);
      } else if (this.outputMethod === Outputs.NEW_FILE) {
        await writeFile(newPath, optimizedDocument, { encoding: 'utf8' });
        this.log(`Created file ${newPath}...`);
      } else if (this.outputMethod === Outputs.OVERWRITE) {
        await writeFile(specPath ?? 'asyncapi.yaml', optimizedDocument, { encoding: 'utf8' });

        this.log(`Updated file ${specPath}...`);
      }
    } catch (error) {
      throw new ValidationError({
        type: 'parser-error',
        err: error
      });
    }
  }

  private showOptimizations(elements: ReportElement[] | undefined) {
    if (!elements) {
      return;
    }

    for (let i = 0; i < elements.length; i++) {
      const element = elements[+i];
      if (element.action==='move') {
        this.log(`${chalk.green('move')} ${element.path} to ${element.target} and reference it.`);
      } else if (element.action==='reuse') {
        this.log(`${chalk.green('reuse')} ${element.target} in ${element.path}.`);
      } else if (element.action === 'remove') {
        this.log(`${chalk.red('remove')} ${element.path}.`);
      }
    }

    this.log('\n');
  }
  private async interactiveRun(report: Report) {
    const canMove = report.moveToComponents?.length;
    const canRemove = report.removeComponents?.length;
    const canReuse = report.reuseComponents?.length;
    const choices = [];

    if (canMove) {
      const totalMove = report.moveToComponents?.filter((e: ReportElement) => e.action === 'move').length;
      this.log(`\n${chalk.green(totalMove)} components can be moved to the components sections.\nthe following changes will be made:`);
      this.showOptimizations(report.moveToComponents);
      choices.push({name: 'move to components section', value: Optimizations.MOVE_TO_COMPONENTS});
    }
    if (canRemove) {
      const totalMove = report.removeComponents?.length;
      this.log(`${chalk.green(totalMove)} unused components can be removed.\nthe following changes will be made:`);
      this.showOptimizations(report.removeComponents);
      choices.push({name: 'remove components', value: Optimizations.REMOVE_COMPONENTS});
    }
    if (canReuse) {
      const totalMove = report.reuseComponents?.length;
      this.log(`${chalk.green(totalMove)} components can be reused.\nthe following changes will be made:`);
      this.showOptimizations(report.reuseComponents);
      choices.push({name: 'reuse components', value: Optimizations.REUSE_COMPONENTS});
    }
    const optimizationRes = await inquirer.prompt([{
      name: 'optimization',
      message: 'select the type of optimization that you want to apply:',
      type: 'checkbox',
      default: 'all',
      choices
    }]);

    this.optimizations = optimizationRes.optimization;
    
    if (!(this.optimizations?.length)) {
      this.metricsMetadata.optimized = false;
    }

    for (const optimizationSelected of optimizationRes.optimization) {
      if (optimizationSelected.length) {
        const toCamelCase = optimizationSelected.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m: any, chr: string) => chr.toUpperCase());
        this.metricsMetadata[`optimization_${toCamelCase}`] = true;
      }
    }

    const outputRes = await inquirer.prompt([{
      name: 'output',
      message: 'where do you want to save the result:',
      type: 'list',
      default: 'log to terminal',
      choices: [{name: 'log to terminal',value: Outputs.TERMINAL}, {name: 'create new file', value: Outputs.NEW_FILE}, {name: 'update original', value: Outputs.OVERWRITE}]
    }]);
    this.outputMethod = outputRes.output;
  }

  private collectMetricsData(report: Report) {
    try {
      // Metrics collection when not using an interactive terminal
      for (const reportOptimization in report) {
        if (reportOptimization.length) {
          this.metricsMetadata[`optimization_${reportOptimization}`] = true;
        }
      }
    } catch (e: any) {
      if (e instanceof Error) {
        this.log(`Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`);
      }
    }
  }
}
