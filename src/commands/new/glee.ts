import {Flags} from '@oclif/core';
import { promises as fPromises } from 'fs';
import Command from '../../base';
import * as inquirer from 'inquirer';
import { start as startStudio, DEFAULT_PORT } from '../../models/Studio';
import { resolve } from 'path';

const { writeFile, readFile } = fPromises;
const DEFAULT_ASYNCAPI_FILE_NAME = 'asyncapi.yaml';
const DEFAULT_ASYNCAPI_TEMPLATE = 'default-example.yaml';

export default class NewGlee extends Command {
  static description = 'Creates a new Glee project';

  static flags = {
    help: Flags.help({ char: 'h' }),
    name: Flags.string({ char: 'n', description: 'name of the project', default: 'glee-project' }),
  };

  async run() {
    // Create new asyncapi file
    const { flags } = await this.parse(NewGlee); // NOSONAR
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
    
    // // Create new glee project
    // const { args } = await this.parse(New);
    // const gleePath = args['glee-project'];

    // if (gleePath) {
    //   // Create glee project folder
    //   await fPromises.mkdir(gleePath);


    //   // Create 'functions' folder inside glee project folder
    //   await fPromises.mkdir(`${gleePath}/functions`);


    //   // DO NOT create asyncapi.yaml file -> Get the file and copy to it to glee folder
    //   const specFile = this.createAsyncapiFile(fileName, template);
    //   if (specFile) {
    //     await fPromises.copyFile(__dirname, `${gleePath}`);
    //   } else {
    //     await fPromises.writeFile(`${gleePath}`, '../../assets/examples/examples.json', { encoding: 'utf8' });

    //   }

    //   // Create package.json file

    //       // DO NOT "npm install to generate file" -> Access to "https://github.com/asyncapi/create-glee-app/blob/master/templates/default/package.json"
    //       // and copy it (same like was done with asyncapi file)
    //       // DO NOT add glee dependency (already included in the accessed file)

    // }
  }

  /* eslint-disable sonarjs/cognitive-complexity */
  async runInteractive() { // NOSONAR
    const { flags } = await this.parse(New); // NOSONAR
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
    const asyncApiFile = await readFile(resolve(__dirname, '../../assets/examples/', selectedTemplate), { encoding: 'utf8' });

    const fileNameHasFileExtension = fileName.includes('.');
    const fileNameToWriteToDisk = fileNameHasFileExtension ? fileName : `${fileName}.yaml`;

    try {
      const content = await readFile(fileNameToWriteToDisk, { encoding: 'utf8' });
      if (content !== '') {
        console.log(`File ${fileNameToWriteToDisk} already exists. Ignoring...`);
        return;
      }
    } catch (e) {
      // File does not exist. Proceed creating it...
    }
    
    await writeFile(fileNameToWriteToDisk, asyncApiFile, { encoding: 'utf8' });
    console.log(`Created file ${fileNameToWriteToDisk}...`);
  }
}
