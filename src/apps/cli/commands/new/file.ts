import { promises as fPromises, readFileSync } from 'fs';
import Command from '@cli/internal/base';
import inquirer from 'inquirer';
import { start as startStudio, DEFAULT_PORT } from '@models/Studio';
import { ensureStudio } from '@models/studio-installer';
import { resolve } from 'path';
import { load } from '@models/SpecificationFile';
import { cyan } from 'picocolors';
import { fileFlags } from '@cli/internal/flags/new/file.flags';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';
import {
  getSpecFileExtension,
  isAllowedSpecExtension,
} from '@utils/spec-file';

const { writeFile, readFile } = fPromises;
const DEFAULT_ASYNCAPI_FILE_NAME = 'asyncapi.yaml';
const DEFAULT_ASYNCAPI_YAML_TEMPLATE = 'default-example.yaml';
const DEFAULT_ASYNCAPI_JSON_TEMPLATE = 'default-example.json';

interface IExample {
  name: string;
  value: string;
}

function loadExampleFile(): IExample[] {
  const exampleFiles = readFileSync(
    resolve(__dirname, '../../../../../assets/examples/examples.json'),
    { encoding: 'utf8' },
  );
  return JSON.parse(exampleFiles);
}

function getExamplesFlagDescription(): string {
  const examples = loadExampleFile();
  let description = 'name of the example to use. Available examples are:';
  for (const example of examples) {
    description += `\n\t - ${example.value}`;
  }
  return description;
}

export default class NewFile extends Command {
  static description = 'Creates a new asyncapi file';

  static flags = fileFlags(getExamplesFlagDescription());

  static examples = [
    'asyncapi new\t - start creation of a file in interactive mode',
    'asyncapi new --file-name=my-asyncapi.yaml --example=default-example.yaml --no-tty\t - create a new file with a specific name, using one of the examples and without interactive mode',
  ];

  async run() {
    const { flags } = await this.parse(NewFile); // NOSONAR
    const isTTY = process.stdout.isTTY;

    if (!flags['no-tty'] && isTTY && !this.jsonEnabled()) {
      return this.runInteractive();
    }

    const fileName = flags['file-name'] || DEFAULT_ASYNCAPI_FILE_NAME;
    // Determine template based on file extension
    let default_template;
    if (fileName.endsWith('.json')) {
      default_template = DEFAULT_ASYNCAPI_JSON_TEMPLATE;
    } else {
      default_template = DEFAULT_ASYNCAPI_YAML_TEMPLATE;
    }
    const template = flags['example'] || default_template;

    const createdFile = await this.createAsyncapiFile(fileName, template);
    let studioStarted = false;
    let studio = null;
    const warnings = [];

    if (flags.studio) {
      if (isTTY || this.jsonEnabled()) {
        const studioPath = await ensureStudio(this.config, {
          yes: flags.yes,
          noInteractive: this.jsonEnabled(),
          quiet: this.jsonEnabled(),
        });
        const started = await startStudio(
          fileName,
          flags.port || DEFAULT_PORT,
          this.jsonEnabled(),
          studioPath,
          this.jsonEnabled(),
        );
        studioStarted = true;
        studio = {
          host: started.host,
          port: started.port,
          url: started.url,
          pid: process.pid,
        };
      } else {
        const message = '--studio was ignored because the terminal is not interactive.';
        this.warn(`Warning: ${message}`);
        warnings.push({ code: 'STUDIO_NOT_STARTED', message });
      }
    }

    return this.result('The AsyncAPI file has been successfully created.', {
      ...createdFile,
      example: template,
      studioStarted,
      studio,
      warnings,
    }, warnings.length > 0 ? 'warning' : 'success');
  }

  /* eslint-disable sonarjs/cognitive-complexity */
  async runInteractive() {
    // NOSONAR
    const { flags } = await this.parse(NewFile); // NOSONAR
    let fileName = flags['file-name'];
    let selectedTemplate = flags['example'];
    let openStudio = flags.studio;
    let examples = [];

    const questions = [];

    if (!fileName) {
      questions.push({
        name: 'filename',
        message: 'name of the file?',
        type: 'input',
        default: DEFAULT_ASYNCAPI_FILE_NAME,
      });
    }

    try {
      const exampleFiles = await readFile(
        resolve(__dirname, '../../assets/examples/examples.json'),
        { encoding: 'utf8' },
      );
      examples = JSON.parse(exampleFiles);
    } catch {
      // no examples found
    }

    if (!selectedTemplate && examples.length > 0) {
      questions.push({
        name: 'use-example',
        message:
          'would you like to start your new file from one of our examples?',
        type: 'confirm',
        default: true,
      });
      questions.push({
        type: 'list',
        name: 'selectedTemplate',
        message: 'What example would you like to use?',
        choices: examples,
        when: (answers: any) => {
          return answers['use-example'];
        },
      });
    }

    if (openStudio === undefined) {
      questions.push({
        name: 'studio',
        message: 'open in Studio?',
        type: 'confirm',
        default: true,
      });
    }

    if (questions.length) {
      const answers: any = await inquirer.prompt(questions);

      if (!fileName) {
        fileName = answers.filename as string;
      }
      if (!selectedTemplate) {
        selectedTemplate = answers.selectedTemplate as string;
      }
      if (openStudio === undefined) {
        openStudio = answers.studio;
      }
    }

    fileName = fileName || DEFAULT_ASYNCAPI_FILE_NAME;
    // Determine template based on file extension
    let default_template;
    if (fileName.endsWith('.json')) {
      default_template = DEFAULT_ASYNCAPI_JSON_TEMPLATE;
    } else {
      default_template = DEFAULT_ASYNCAPI_YAML_TEMPLATE;
    }
    selectedTemplate = selectedTemplate || default_template;

    const createdFile = await this.createAsyncapiFile(fileName, selectedTemplate);
    fileName = fileName.includes('.') ? fileName : `${fileName}.yaml`;
    let studioStarted = false;
    let studio = null;
    if (openStudio) {
      const studioPath = await ensureStudio(this.config, {
        yes: flags.yes,
        quiet: this.jsonEnabled(),
      });
      const started = await startStudio(
        fileName,
        flags.port || DEFAULT_PORT,
        this.jsonEnabled(),
        studioPath,
        this.jsonEnabled(),
      );
      studioStarted = true;
      studio = {
        host: started.host,
        port: started.port,
        url: started.url,
        pid: process.pid,
      };
    }

    return this.result('The AsyncAPI file has been successfully created.', {
      ...createdFile,
      example: selectedTemplate,
      studioStarted,
      studio,
      warnings: [],
    });
  }

  async createAsyncapiFile(fileName: string, selectedTemplate: string) {
    let fileNameToWriteToDisk;

    if (!fileName.includes('.')) {
      fileNameToWriteToDisk = `${fileName}.yaml`;
    } else {
      const extension = getSpecFileExtension(fileName);

      if (isAllowedSpecExtension(extension)) {
        fileNameToWriteToDisk = fileName;
      } else {
        throw new ApplicationError(
          CLI_ERROR_CODES.FILE_EXTENSION_UNSUPPORTED,
          'CLI Support only yml, yaml and json extension for file',
          { details: { path: resolve(fileName) } },
        );
      }
    }

    const asyncApiFile = await readFile(
      resolve(__dirname, '../../../../../assets/examples/', selectedTemplate),
      { encoding: 'utf8' },
    );

    try {
      const content = await readFile(fileNameToWriteToDisk, {
        encoding: 'utf8',
      });
      if (content !== undefined) {
        throw new ApplicationError(
          CLI_ERROR_CODES.FILE_ALREADY_EXISTS,
          `A file named ${fileNameToWriteToDisk} already exists. Please choose a different name.`,
          { details: { path: resolve(fileNameToWriteToDisk) } },
        );
      }
    } catch (e: any) {
      if (e instanceof ApplicationError) {
        throw e;
      }
      if (e.code === 'EACCES') {
        throw new ApplicationError(
          CLI_ERROR_CODES.FILE_PERMISSION_DENIED,
          'Permission has been denied to access the file.',
          { cause: e, details: { path: resolve(fileNameToWriteToDisk) } },
        );
      }
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
    await writeFile(fileNameToWriteToDisk, asyncApiFile, { encoding: 'utf8' });
    this.log(
      `The ${cyan(fileNameToWriteToDisk)} has been successfully created.`,
    );
    this.specFile = await load(fileNameToWriteToDisk);
    this.metricsMetadata.selected_template = selectedTemplate;
    const extension = getSpecFileExtension(fileNameToWriteToDisk);
    return {
      path: resolve(fileNameToWriteToDisk),
      format: extension === 'json' ? 'json' : extension,
    };
  }
}
