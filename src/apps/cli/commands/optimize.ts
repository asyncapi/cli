import { Args } from '@oclif/core';
import { Optimizer, Output } from '@asyncapi/optimizer';
import Command from '@cli/internal/base';
import { ValidationError } from '@errors/validation-error';
import { Specification, load, retrieveFileFormat } from '@models/SpecificationFile';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { existsSync, promises } from 'node:fs';
import path from 'node:path';
import { optimizeFlags } from '@cli/internal/flags/optimize.flags';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { applyProxyToPath } from '@utils/proxy';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

const { writeFile } = promises;

// Keep the command on the optimizer v2 contract even when local dependencies
// still expose the v1 declaration files.
interface ReportElement {
  path: string;
  action: 'move' | 'remove' | 'reuse';
  target?: string;
}

interface Report {
  type: string;
  elements: ReportElement[];
}

interface OptimizerV2 {
  getReport(): Promise<Report[]>;
  getOptimizedDocument(options: {
    rules: Record<string, boolean>;
    disableOptimizationFor: { schema: boolean };
    output: Output;
  }): string;
}

interface OptimizeData {
  source: {
    input: string;
    kind: 'file' | 'url' | 'context' | 'auto-detected';
    resolved: string;
  };
  optimized: boolean;
  applied: Optimizations[];
  ignored: DisableOptimizations[];
  report: Report[];
  document: Record<string, unknown> | null;
  output: {
    path: string;
    format: 'json' | 'yaml';
    overwritten: boolean;
  } | null;
  warnings: Array<{ code: string; message: string }>;
}

export enum Optimizations {
  REMOVE_COMPONENTS = 'remove-components',
  REUSE_COMPONENTS = 'reuse-components',
  MOVE_DUPLICATES_TO_COMPONENTS = 'move-duplicates-to-components',
  MOVE_ALL_TO_COMPONENTS = 'move-all-to-components',
}

export enum DisableOptimizations {
  SCHEMA = 'schema',
}

export enum Outputs {
  TERMINAL = 'terminal',
  NEW_FILE = 'new-file',
  OVERWRITE = 'overwrite',
}
export default class Optimize extends Command {
  static description = 'optimize asyncapi specification file';
  isInteractive = false;
  selectedOptimizations?: Optimizations[];
  disableOptimizations?: DisableOptimizations[];
  outputMethod?: Outputs;

  static examples = [
    'asyncapi optimize ./asyncapi.yaml',
    'asyncapi optimize ./asyncapi.yaml --no-tty',
    'asyncapi optimize ./asyncapi.yaml --optimization=remove-components --optimization=reuse-components --optimization=move-all-to-components --no-tty',
    'asyncapi optimize ./asyncapi.yaml --optimization=remove-components --output=terminal --no-tty',
    'asyncapi optimize ./asyncapi.yaml --ignore=schema',
  ];

  static flags = {
    ...optimizeFlags(),
    ...proxyFlags(),
  };

  static args = {
    'spec-file': Args.string({
      description: 'spec path, url, or context-name',
      required: false,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Optimize); //NOSONAR
    const input = args['spec-file'];
    const filePath = applyProxyToPath(
      input,
      flags['proxyHost'],
      flags['proxyPort']
    );
    await this.loadSpecFile(filePath);
    const specFile = this.requireSpecFile();

    this.isInteractive = !flags['no-tty'] && !this.jsonEnabled();
    this.selectedOptimizations = flags.optimization as Optimizations[];
    this.disableOptimizations = flags.ignore as DisableOptimizations[];
    this.outputMethod = flags.output as Outputs;
    this.metricsMetadata.optimized = false;

    const { optimizer, report } = await this.buildOptimizerReport(specFile);
    const source = this.getSource(input, specFile);

    if (!this.hasAvailableOptimizations(report)) {
      const message = `🎉 Great news! Your file at ${specFile.getFilePath() ?? specFile.getFileURL()} is already optimized.`;
      if (!this.jsonEnabled()) {
        this.log(message);
      }
      return this.result(message, {
        source,
        optimized: false,
        applied: [],
        ignored: this.disableOptimizations,
        report,
        document: this.outputMethod === Outputs.TERMINAL ? specFile.toJson() : null,
        output: null,
        warnings: [],
      } satisfies OptimizeData);
    }

    if (this.isInteractive && process.stdout.isTTY) {
      await this.interactiveRun(report);
    }

    const data = await this.writeOptimizedDocument(optimizer, report, specFile);
    return this.result('AsyncAPI document optimized successfully.', {
      source,
      ...data,
    } satisfies OptimizeData);
  }

  private requireSpecFile() {
    const specFile = this.specFile;
    if (!specFile) {
      throw noSpecFoundError();
    }
    return specFile;
  }

  private async loadSpecFile(filePath: string | undefined): Promise<void> {
    try {
      this.specFile = await load(filePath);
    } catch (err: any) {
      if (err?.message?.includes('Failed to download')) {
        // Preserve the historical `Error:` prefix in human output.
        throw Object.assign(
          new ApplicationError(
            CLI_ERROR_CODES.PROXY_ERROR,
            'Proxy Connection Error: Unable to establish a connection to the proxy check hostName or PortNumber.',
            { cause: err },
          ),
          { name: 'Error' },
        );
      }
      if (filePath) {
        const validationError = new ValidationError({
          type: 'invalid-file',
          filepath: filePath,
        });
        // Preserve the historical `ValidationError:` prefix in human output.
        throw Object.assign(
          new ApplicationError(
            CLI_ERROR_CODES.SPEC_FILE_NOT_FOUND,
            validationError.message,
            { cause: err },
          ),
          { name: validationError.name },
        );
      }
      throw noSpecFoundError(err);
    }
  }

  private async buildOptimizerReport(specFile: NonNullable<Optimize['specFile']>): Promise<{ optimizer: OptimizerV2; report: Report[] }> {
    try {
      const optimizer = new Optimizer(specFile.text()) as unknown as OptimizerV2;
      const report = await optimizer.getReport();
      return { optimizer, report };
    } catch (err: unknown) {
      const details = err && typeof err === 'object' && 'details' in err
        ? (err as { details?: unknown }).details
        : undefined;
      if (!this.jsonEnabled() && details) {
        this.logToStderr(
          typeof details === 'string'
            ? details
            : JSON.stringify(details, null, 2),
        );
      }
      throw err;
    }
  }

  private getSource(
    input: string | undefined,
    specFile: NonNullable<Optimize['specFile']>,
  ): OptimizeData['source'] {
    const filePath = specFile.getFilePath();
    const fileURL = specFile.getFileURL();
    const resolved = filePath ? path.resolve(filePath) : fileURL as string;
    let kind: OptimizeData['source']['kind'] = 'auto-detected';
    if (fileURL) {
      kind = 'url';
    } else if (input) {
      kind = filePath && path.resolve(input) === path.resolve(filePath)
        ? 'file'
        : 'context';
    }
    return {
      input: input ?? filePath ?? fileURL as string,
      kind,
      resolved,
    };
  }

  private hasAvailableOptimizations(report: Report[]): boolean {
    return Boolean(
      this.getElements(report, 'moveDuplicatesToComponents').length ||
        this.getElements(report, 'moveAllToComponents').length ||
        this.getElements(report, 'removeComponents').length ||
        this.getElements(report, 'reuseComponents').length,
    );
  }

  private async writeOptimizedDocument(
    optimizer: OptimizerV2,
    report: Report[],
    specFile: NonNullable<Optimize['specFile']>,
  ): Promise<Omit<OptimizeData, 'source'>> {
    const selectedOptimizations = this.selectedOptimizations ?? [];
    const disableOptimizations = this.disableOptimizations ?? [];
    const fileFormat = retrieveFileFormat(specFile.text()) === 'json' ? 'json' : 'yaml';
    const reportForOutput = report.map((group) => ({
      type: group.type,
      elements: group.elements.map((element) => ({ ...element })),
    }));
    const applied = selectedOptimizations.filter((optimization) => {
      const reportType = optimization.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
      return this.getElements(report, reportType).some((element) =>
        !disableOptimizations.includes(DisableOptimizations.SCHEMA) ||
        !element.target?.includes('.schemas.')
      );
    });
    let optimizedDocument = optimizer.getOptimizedDocument({
      rules: {
        moveDuplicatesToComponents: selectedOptimizations.includes(
          Optimizations.MOVE_DUPLICATES_TO_COMPONENTS,
        ),
        moveAllToComponents: selectedOptimizations.includes(
          Optimizations.MOVE_ALL_TO_COMPONENTS,
        ),
        removeComponents: selectedOptimizations.includes(
          Optimizations.REMOVE_COMPONENTS,
        ),
        reuseComponents: selectedOptimizations.includes(
          Optimizations.REUSE_COMPONENTS,
        ),
      },
      disableOptimizationFor: {
        schema: disableOptimizations.includes(
          DisableOptimizations.SCHEMA,
        ),
      },
      output: fileFormat === 'json' ? Output.JSON : Output.YAML,
    });
    if (fileFormat === 'json') {
      optimizedDocument = JSON.stringify(JSON.parse(optimizedDocument), null, 2);
    }

    this.collectMetricsData(report);

    const specPath = specFile.getFilePath();
    let newPath: string;

    if (specPath) {
      const pos = specPath.lastIndexOf('.');
      newPath = `${specPath.substring(0, pos)}_optimized.${specPath.substring(pos + 1)}`;
    } else {
      newPath = `optimized-asyncapi.${fileFormat}`;
    }

    let output: OptimizeData['output'] = null;
    let document: OptimizeData['document'] = null;
    switch (this.outputMethod) {
    case Outputs.TERMINAL:
      document = fileFormat === 'json'
        ? JSON.parse(optimizedDocument) as Record<string, unknown>
        : new Specification(optimizedDocument).toJson();
      if (!this.jsonEnabled()) {
        this.log('📄 Here is your optimized AsyncAPI document:\n');
        this.log(optimizedDocument);
      }
      break;
    case Outputs.NEW_FILE: {
      const outputPath = path.resolve(newPath);
      const overwritten = existsSync(outputPath);
      await writeFile(outputPath, optimizedDocument, { encoding: 'utf8' });
      output = { path: outputPath, format: fileFormat, overwritten };
      if (!this.jsonEnabled()) {
        this.log(
          `✅ Success! Your optimized file has been created at ${chalk.blue(newPath)}.`,
        );
      }
      break;
    }
    case Outputs.OVERWRITE: {
      const outputPath = path.resolve(specPath ?? `asyncapi.${fileFormat}`);
      const overwritten = existsSync(outputPath);
      await writeFile(outputPath, optimizedDocument, { encoding: 'utf8' });
      output = { path: outputPath, format: fileFormat, overwritten };
      if (!this.jsonEnabled()) {
        this.log(
          `✅ Success! Your original file at ${specPath} has been updated.`,
        );
      }
      break;
    }
    }

    return {
      optimized: applied.length > 0,
      applied,
      ignored: disableOptimizations,
      report: reportForOutput,
      document,
      output,
      warnings: [],
    };
  }

  private getElements(report: Report[], type: string): ReportElement[] {
    return report.find((group) => group.type === type)?.elements ?? [];
  }

  private showOptimizations(elements: ReportElement[] | undefined) {
    if (!elements) {
      return;
    }

    for (let i = 0; i < elements.length; i++) {
      const element = elements[+i];
      if (element.action === 'move') {
        this.log(
          `${chalk.green('move')} ${element.path} to ${element.target} and reference it.`,
        );
      } else if (element.action === 'reuse') {
        this.log(
          `${chalk.green('reuse')} ${element.target} in ${element.path}.`,
        );
      } else if (element.action === 'remove') {
        this.log(`${chalk.red('remove')} ${element.path}.`);
      }
    }

    this.log('\n');
  }

  private async interactiveRun(report: Report[]) {
    const moveAll = this.getElements(report, 'moveAllToComponents');
    const moveDuplicates = this.getElements(report, 'moveDuplicatesToComponents');
    const remove = this.getElements(report, 'removeComponents');
    const reuse = this.getElements(report, 'reuseComponents');
    const canMoveDuplicates = moveDuplicates.length;
    const canMoveAll = moveAll.length;
    const canRemove = remove.length;
    const canReuse = reuse.length;
    const choices = [];

    if (canMoveAll) {
      const totalMove = moveAll.filter(
        (e: ReportElement) => e.action === 'move',
      ).length;
      this.log(
        `${chalk.green(totalMove)} components can be moved to the components sections.\nthe following changes will be made:`,
      );
      this.showOptimizations(moveAll);
      choices.push({
        name: 'move all $refs to components section',
        value: Optimizations.MOVE_ALL_TO_COMPONENTS,
      });
    }
    if (canMoveDuplicates) {
      const totalMove = moveDuplicates.filter(
        (e: ReportElement) => e.action === 'move',
      ).length;
      this.log(
        `\n${chalk.green(totalMove)} components can be moved to the components sections.\nthe following changes will be made:`,
      );
      this.showOptimizations(moveDuplicates);
      choices.push({
        name: 'move to components section',
        value: Optimizations.MOVE_DUPLICATES_TO_COMPONENTS,
      });
    }
    if (canRemove) {
      const totalMove = remove.length;
      this.log(
        `${chalk.green(totalMove)} unused components can be removed.\nthe following changes will be made:`,
      );
      this.showOptimizations(remove);
      choices.push({
        name: 'remove components',
        value: Optimizations.REMOVE_COMPONENTS,
      });
    }
    if (canReuse) {
      const totalMove = reuse.length;
      this.log(
        `${chalk.green(totalMove)} components can be reused.\nthe following changes will be made:`,
      );
      this.showOptimizations(reuse);
      choices.push({
        name: 'reuse components',
        value: Optimizations.REUSE_COMPONENTS,
      });
    }

    if (this.disableOptimizations?.includes(DisableOptimizations.SCHEMA)) {
      choices.push({
        name: 'Do not ignore schema',
        value: DisableOptimizations.SCHEMA,
      });
    } else {
      choices.push({
        name: 'Ignore schema',
        value: DisableOptimizations.SCHEMA,
      });
    }

    const optimizationRes = await inquirer.prompt([
      {
        name: 'optimization',
        message: 'select the type of optimization that you want to apply:',
        type: 'checkbox',
        default: 'all',
        choices,
      },
    ]);

    if (optimizationRes.optimization.includes('schema')) {
      if (this.disableOptimizations?.includes(DisableOptimizations.SCHEMA)) {
        this.disableOptimizations = this.disableOptimizations?.filter(
          (opt) => opt !== DisableOptimizations.SCHEMA,
        );
      } else {
        this.disableOptimizations = [
          ...(this.disableOptimizations || []),
          DisableOptimizations.SCHEMA,
        ];
      }
    }

    this.selectedOptimizations = optimizationRes.optimization;

    const outputRes = await inquirer.prompt([
      {
        name: 'output',
        message: 'where do you want to save the result:',
        type: 'list',
        default: 'log to terminal',
        choices: [
          { name: 'log to terminal', value: Outputs.TERMINAL },
          { name: 'create new file', value: Outputs.NEW_FILE },
          { name: 'update original file', value: Outputs.OVERWRITE },
        ],
      },
    ]);
    this.outputMethod = outputRes.output;
  }

  private collectMetricsData(report: Report[]) {
    for (const group of report) {
      const availableOptimization = group.type;
      const availableOptimizationKebabCase = availableOptimization
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase(); // optimization flags are kebab case
      if (
        availableOptimization.length &&
        this.selectedOptimizations?.includes(
          availableOptimizationKebabCase as Optimizations,
        )
      ) {
        this.metricsMetadata[`optimization_${availableOptimization}`] = true;
        this.metricsMetadata.optimized = true;
      }
    }
  }
}

function noSpecFoundError(cause?: unknown): ApplicationError {
  const validationError = new ValidationError({ type: 'no-spec-found' });
  // Preserve the historical `ValidationError:` prefix in human output.
  return Object.assign(
    new ApplicationError(
      CLI_ERROR_CODES.CLI_INPUT_REQUIRED,
      validationError.message,
      cause === undefined ? {} : { cause },
    ),
    { name: validationError.name },
  );
}
