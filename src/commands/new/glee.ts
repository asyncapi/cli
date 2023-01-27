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
  
  protected commandName = 'glee';

  static flags = {
    help: Flags.help({ char: 'h' }),
    name: Flags.string({ char: 'n', description: 'name of the project', default: 'glee-project' }),
  };

  async run() {
    const { flags } = await this.parse(NewGlee); // NOSONAR

    const projectName = flags.name;

    const PROJECT_DIRECTORY = path.join(process.cwd(), projectName);
    const GLEE_TEMPLATES_DIRECTORY = resolve(__dirname, '../../../create-glee-app/templates/default');

    try {
      await fPromises.mkdir(PROJECT_DIRECTORY);
    } catch (err) {
      console.error(`Unable to create the project. We tried to use "${projectName}" as the directory of your new project but it already exists (${PROJECT_DIRECTORY}). Please specify a different name for the new project. For example, run the following command instead:\n\n  asyncapi new ${this.commandName} --name ${projectName}-1\n`);
      return;
    }
    
    try {
      await fs.copy(GLEE_TEMPLATES_DIRECTORY, PROJECT_DIRECTORY);
      console.log(`Your project "${projectName}" has been created successfully!\n\nNext steps:\n\n  cd ${projectName}\n  npm install\n  npm run dev\n\nAlso, you can already open the project in your favorite editor and start tweaking it.`);
    } catch (err) {
      console.error(err);
    }
  }
}
