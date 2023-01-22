import {Flags} from '@oclif/core';
import { promises as fPromises } from 'fs';
import Command from '../../base';
import { resolve } from 'path';

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

    // Create glee project folder
    //  if (gleePath) {
    //  await fPromises.mkdir(gleePath);


    // Create 'functions' folder inside glee project folder
    //   await fPromises.mkdir(`${gleePath}/functions`);


    // asyncapi.yaml file -> Get the file and copy to it to glee folder
    //   const specFile = this.createAsyncapiFile(fileName, template);
    //   if (specFile) {
    //     await fPromises.copyFile(__dirname, `${gleePath}`);
    //   } else {
    //     await fPromises.writeFile(`${gleePath}`, '../../assets/examples/examples.json', { encoding: 'utf8' });

    //   }

    // Create package.json file

    //       // DO NOT "npm install to generate file" -> Access to "https://github.com/asyncapi/create-glee-app/blob/master/templates/default/package.json"
    //       // and copy it (same like was done with asyncapi file)
    //       // DO NOT add glee dependency (already included in the accessed file)

    // }
  }
}
