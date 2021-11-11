import { promises as fPromises } from 'fs';
import {flags} from '@oclif/command';
import Command from '../base';
import * as inquirer from 'inquirer';
import { start as startStudio, DEFAULT_PORT } from '../models/Studio';
import { resolve } from 'path';

const { writeFile, readFile } = fPromises;
const DEFAULT_ASYNCAPI_FILE_NAME = 'asyncapi.yaml';

export default class New extends Command {
  static description = 'creates a new asyncapi file';

  static flags = {
    help: flags.help({ char: 'h' }),
    'file-name': flags.string({ char: 'n', description: 'name of the file' }),
    studio: flags.boolean({ char: 's', description: 'open in Studio' }),
    port: flags.integer({ char: 'p', description: 'port in which to start Studio' }),
    'no-tty': flags.boolean({ description: 'do not use an interactive terminal' }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(New);
    const isTTY = process.stdout.isTTY;

    if (!flags['no-tty'] && isTTY) {
      return this.runInteractive();
    }

    const fileName = flags['file-name'] || DEFAULT_ASYNCAPI_FILE_NAME;
    this.createAsyncapiFile(fileName);

    if (flags.studio) {
      if (isTTY) {
        startStudio(fileName, flags.port || DEFAULT_PORT);
      } else {
        this.warn('Warning: --studio flag was passed but the terminal is not interactive. Ignoring...');
      }
    }
  }

  async runInteractive() {
    const { flags } = this.parse(New);
    let fileName = flags['file-name'];
    let openStudio = flags.studio;

    const questions = [];

    if (!fileName) {
      questions.push({
        name: 'filename',
        message: 'name of the file?',
        type: 'input',
        default: DEFAULT_ASYNCAPI_FILE_NAME,
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
      if (openStudio === undefined) {openStudio = answers.studio;}
    } else {
      fileName = DEFAULT_ASYNCAPI_FILE_NAME;
    }

    await this.createAsyncapiFile(fileName);
    if (openStudio) { startStudio(fileName, flags.port || DEFAULT_PORT);}
  }

  async createAsyncapiFile(fileName:string) {
    const defaultAsyncapiFile = await readFile(resolve(__dirname, '../../assets/asyncapi.yaml'), { encoding: 'utf8' });

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
    
    await writeFile(fileNameToWriteToDisk, defaultAsyncapiFile, { encoding: 'utf8' });
    console.log(`Created file ${fileNameToWriteToDisk}...`);
  }
}
