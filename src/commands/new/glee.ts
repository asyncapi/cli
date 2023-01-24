import {Flags} from '@oclif/core';
import { fstat, promises as fPromises } from 'fs';
import Command from '../../base';
import { resolve } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';

const { writeFile, readFile } = fPromises;

export default class NewGlee extends Command {
  static description = 'Creates a new Glee project';

  static flags = {
    help: Flags.help({ char: 'h' }),
    name: Flags.string({ char: 'n', description: 'name of the project', default: 'glee-project' }),
  };

  async run() {
    const { flags } = await this.parse(NewGlee); // NOSONAR

    const projectName = flags.name;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    console.log(__dirname);

    const PROJECT_DIRECTORY = path.resolve(__dirname, `../../../${projectName}`);
    const GLEE_TEMPLATES_DIRECTORY = path.resolve(__dirname, '../../../create-glee-app/templates/default');
    
    // Create glee project folder
    await fPromises.mkdir(PROJECT_DIRECTORY);
    console.log('Glee project folder created!');

    // Add 'functions' folder to Glee project
    await fPromises.copyFile(path.join(GLEE_TEMPLATES_DIRECTORY, 'functions'), PROJECT_DIRECTORY);
    console.log('functions folder added.');

    // Add 'asyncapi.yaml' file to Glee project
    await fPromises.copyFile(path.join(GLEE_TEMPLATES_DIRECTORY, 'asyncapi.yaml'), PROJECT_DIRECTORY);
    console.log('asyncapi.yaml file added.');

    // Add 'package.json' file to Glee project
    await fPromises.copyFile(path.join(GLEE_TEMPLATES_DIRECTORY, 'package.json'), PROJECT_DIRECTORY);
    console.log('package.json file added.');
  }
}
