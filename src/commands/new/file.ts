import { promises as fPromises, readFileSync } from 'fs';
import Command from '../../core/base';
import * as inquirer from 'inquirer';
import { start as startStudio, DEFAULT_PORT } from '../../core/models/Studio';
import { resolve } from 'path';
import { load } from '../../core/models/SpecificationFile';
import { cyan } from 'picocolors';
import { fileFlags } from '../../core/flags/new/file.flags';

const { writeFile, readFile } = fPromises;
const DEFAULT_ASYNCAPI_FILE_NAME = 'asyncapi.yaml';
const DEFAULT_ASYNCAPI_TEMPLATE = 'default-example.yaml';

interface IExample{
  name: string,
  value: string,
}

function loadExampleFile (): IExample[] {
  const exampleFiles = readFileSync(resolve(__dirname, '../../../assets/examples/examples.json'), { encoding: 'utf8' });
  return JSON.parse(exampleFiles);
}

function getExamplesFlagDescription (): string {
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
    'asyncapi new --file-name=my-asyncapi.yml --example=default-example.yml --no-tty\t - create a new file with a specific name, using one of the examples and without interactive mode'
  ];

  async run() {
    const { flags } = await this.parse(NewFile); // NOSONAR
    const isTTY = process.stdout.isTTY;

    if (!flags['no-tty'] && isTTY) {
      return this.runInteractive();
    }

    const fileName = flags['file-name'] || DEFAULT_ASYNCAPI_FILE_NAME;
    const template = flags['example'] || DEFAULT_ASYNCAPI_TEMPLATE;

    await this.createAsyncapiFile(fileName, template);

    if (flags.studio) {
      if (isTTY) {
        startStudio(fileName, flags.port || DEFAULT_PORT);
      } else {
        this.warn('Warning: --studio flag was passed but the terminal is not interactive. Ignoring...');
      }
    }
  }

  /* eslint-disable sonarjs/cognitive-complexity */
  async runInteractive() { // NOSONAR
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
      const exampleFiles = await readFile(resolve(__dirname, '../../assets/examples/examples.json'), { encoding: 'utf8' });
      examples = JSON.parse(exampleFiles);
    } catch (error) {
      // no examples found
    }

    if (!selectedTemplate && examples.length > 0) {
      questions.push({
        name: 'use-example',
        message: 'would you like to start your new file from one of our examples?',
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

      if (!fileName) {fileName = answers.filename as string;}
      if (!selectedTemplate) {selectedTemplate = answers.selectedTemplate as string;}
      if (openStudio === undefined) {openStudio = answers.studio;}
    }

    fileName = fileName || DEFAULT_ASYNCAPI_FILE_NAME;
    selectedTemplate = selectedTemplate || DEFAULT_ASYNCAPI_TEMPLATE;

    await this.createAsyncapiFile(fileName, selectedTemplate);
    if (openStudio) { startStudio(fileName, flags.port || DEFAULT_PORT);}
  }

  async createAsyncapiFile(fileName:string, selectedTemplate:string) {
    const asyncApiFile = await readFile(resolve(__dirname, '../../../assets/examples/', selectedTemplate), { encoding: 'utf8' });

    let fileNameToWriteToDisk;

    if (!fileName.includes('.')) {
      fileNameToWriteToDisk=`${fileName}.yaml`;
    } else {
      const extension=fileName.split('.')[1];

      if (extension==='yml'||extension==='yaml'||extension==='json') {
        fileNameToWriteToDisk=fileName;
      } else {
        console.log('CLI Support only yml, yaml and json extension for file');

        return;
      }
    }

    try {
      const content = await readFile(fileNameToWriteToDisk, { encoding: 'utf8' });
      if (content !== undefined) {
        console.log(`A file named ${fileNameToWriteToDisk} already exists. Please choose a different name.`);
        return;
      }
    } catch (e:any) {
      if (e.code === 'EACCES') {
        this.error('Permission has been denied to access the file.');
      }
    }
    await writeFile(fileNameToWriteToDisk, asyncApiFile, { encoding: 'utf8' });
    console.log(`The ${cyan(fileNameToWriteToDisk)} has been successfully created.`);
    this.specFile = await load(fileNameToWriteToDisk);
    this.metricsMetadata.selected_template = selectedTemplate;
  }
}
