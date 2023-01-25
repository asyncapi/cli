import {Flags} from '@oclif/core';
import { fstat, promises as fPromises } from 'fs';
import Command from '../../base';
import { resolve } from 'path';
import path from 'path';
import fs from 'fs-extra';

const { writeFile, readFile } = fPromises;
const fs = require('fs-extra');

export default class NewGlee extends Command {
  static description = 'Creates a new Glee project';

  static flags = {
    help: Flags.help({ char: 'h' }),
    name: Flags.string({ char: 'n', description: 'name of the project', default: 'glee-project' }),
  };

  async run() {
    const { flags } = await this.parse(NewGlee); // NOSONAR

    const projectName = flags.name;

    const PROJECT_DIRECTORY = path.join(process.cwd(), projectName); // cwd-> /Users/pedro.ramos/cli
    const GLEE_TEMPLATES_DIRECTORY = resolve(__dirname, '../../../create-glee-app/templates/default'); // __dirname-> /Users/pedro.ramos/cli/lib/commands/new

    try {
      await fPromises.mkdir(PROJECT_DIRECTORY);
      console.log('Glee project folder created!');
    } catch (err) {
      console.error('An existing folder is already using the same name of your Glee project. Please specify a different name for the new project, or just remove the existing folder from the current directory.');
      return;
    }
    
    try {
      await fs.copy(GLEE_TEMPLATES_DIRECTORY, PROJECT_DIRECTORY);
      console.log('Content copied to your project folder!');
    } catch (err) {
      console.error(err);
    }
  }
}
