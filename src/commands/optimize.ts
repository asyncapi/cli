import { Flags, Args } from '@oclif/core';
import { Optimizer, Output, Report, ReportElement } from '@asyncapi/optimizer';
import Command from '../base';
import { ValidationError } from '../errors/validation-error';
import { load } from '../models/SpecificationFile';
import * as inquirer from 'inquirer';
import chalk from 'chalk';
import { promises } from 'fs';
import { Parser } from '@asyncapi/parser';

const { writeFile } = promises;

export enum Optimizations {
  REMOVE_COMPONENTS='remove-components',
  REUSE_COMPONENTS='reuse-components',
  MOVE_DUPLICATES_TO_COMPONENTS='move-duplicates-to-components',
  MOVE_ALL_TO_COMPONENTS='move-all-to-components',
}

export enum Outputs {
  TERMINAL='terminal',
  NEW_FILE='new-file',
  OVERWRITE='overwrite'
}
export default class Optimize extends Command {
  static description = 'optimize asyncapi specification file';
  isInteractive = false;
  selectedOptimizations?: Optimizations[];
  outputMethod?: Outputs;

  static examples = [
    'asyncapi optimize ./asyncapi.yaml',
    'asyncapi optimize ./asyncapi.yaml --no-tty',
    'asyncapi optimize ./asyncapi.yaml --optimization=remove-components --optimization=reuse-components --optimization=move-all-to-components --no-tty',
    'asyncapi optimize ./asyncapi.yaml --optimization=remove-components --output=terminal --no-tty',
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    optimization: Flags.string({char: 'p', default: Object.values(Optimizations), options: Object.values(Optimizations), multiple: true, description: 'select the type of optimizations that you want to apply.'}),
    output: Flags.string({char: 'o', default: Outputs.TERMINAL, options: Object.values(Outputs), description: 'select where you want the output.'}),
    'no-tty': Flags.boolean({ description: 'do not use an interactive terminal', default: false }),
  };

  static args = {
    'spec-file': Args.string({description: 'spec path, url, or context-name', required: false}),
  };

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
    this.selectedOptimizations = flags.optimization as Optimizations[];
    this.outputMethod = flags.output as Outputs;
    this.metricsMetadata.optimized = false;

    if (!(report.moveDuplicatesToComponents?.length || report.removeComponents?.length || report.reuseComponents?.length)) {
      this.log(`No optimization has been applied since ${this.specFile.getFilePath() ?? this.specFile.getFileURL()} looks optimized!`);
      return;
    }

    const isTTY = process.stdout.isTTY;
    if (this.isInteractive && isTTY) {
      await this.interactiveRun(report);
    }

    try {
      const optimizedDocument = optimizer.getOptimizedDocument({rules: {
        moveDuplicatesToComponents: this.selectedOptimizations.includes(Optimizations.MOVE_DUPLICATES_TO_COMPONENTS),
        moveAllToComponents: this.selectedOptimizations.includes(Optimizations.MOVE_ALL_TO_COMPONENTS),
        removeComponents: this.selectedOptimizations.includes(Optimizations.REMOVE_COMPONENTS),
        reuseComponents: this.selectedOptimizations.includes(Optimizations.REUSE_COMPONENTS)
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

      switch (this.outputMethod) {
      case Outputs.TERMINAL:
        this.log(optimizedDocument);
        break;
      case Outputs.NEW_FILE:
        await writeFile(newPath, optimizedDocument, { encoding: 'utf8' });
        this.log(`Created file ${newPath}...`);
        break;
      case Outputs.OVERWRITE:
        await writeFile(specPath ?? 'asyncapi.yaml', optimizedDocument, { encoding: 'utf8' });
        this.log(`Updated file ${specPath}...`);
        break;
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
    const canMoveDuplicates = report.moveDuplicatesToComponents?.length;
    const canMoveAll = report.moveAllToComponents?.length;
    const canRemove = report.removeComponents?.length;
    const canReuse = report.reuseComponents?.length;
    const choices = [];

    if (canMoveAll) {
      const totalMove = report.moveAllToComponents?.filter((e: ReportElement) => e.action === 'move').length;
      this.log(`${chalk.green(totalMove)} components can be moved to the components sections.\nthe following changes will be made:`);
      this.showOptimizations(report.moveAllToComponents);
      choices.push({name: 'move all $refs to components section', value: Optimizations.MOVE_ALL_TO_COMPONENTS});
    }
    if (canMoveDuplicates) {
      const totalMove = report.moveDuplicatesToComponents?.filter((e: ReportElement) => e.action === 'move').length;
      this.log(`\n${chalk.green(totalMove)} components can be moved to the components sections.\nthe following changes will be made:`);
      this.showOptimizations(report.moveDuplicatesToComponents);
      choices.push({name: 'move to components section', value: Optimizations.MOVE_DUPLICATES_TO_COMPONENTS});
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

    this.selectedOptimizations = optimizationRes.optimization;

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
    for (const availableOptimization in report) {
      const availableOptimizationKebabCase = availableOptimization.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(); // optimization flags are kebab case
      if (availableOptimization.length && this.selectedOptimizations?.includes(availableOptimizationKebabCase as Optimizations)) {
        this.metricsMetadata[`optimization_${availableOptimization}`] = true;
        this.metricsMetadata.optimized = true;
      }
    }
  }
}
