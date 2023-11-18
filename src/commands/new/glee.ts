import {Flags} from '@oclif/core';
import { promises as fPromises } from 'fs';
import Command from '../../base';
import { resolve, join } from 'path';
import fs from 'fs-extra';
import { load, Specification } from '../../models/SpecificationFile';
import {parse} from '../../parser'
import { exec } from 'child_process';

export default class NewGlee extends Command {
  static description = 'Creates a new Glee project';
  
  protected commandName = 'glee';

  static flags = {
    help: Flags.help({ char: 'h' }),
    name: Flags.string({ char: 'n', description: 'name of the project', default: 'project' }),
  };

  static args = [
    {
      name: 'file',
      description: 'spec path, URL or context-name',
      required: true,
    },
  ];
  async run() {
    const {args,flags } = await this.parse(NewGlee); // NOSONAR

    const projectName = flags.name;
    // console.log(flags.name , {flags} , {args})

    const PROJECT_DIRECTORY = join(process.cwd(), projectName);
    const GLEE_TEMPLATES_DIRECTORY = resolve(__dirname, '../../../assets/create-glee-app/templates/default');
    let operationList : Array<any> = []
    let response:any;
    let asyncApiFile:any;
    try {
      await fPromises.mkdir(PROJECT_DIRECTORY);
      const document  = await load(args.file);
       response = await parse(this, document)
      const Jsondocument:any = JSON.stringify(response.document)
      asyncApiFile = response.document._meta.asyncapi.input;

      // console.log({document},{response},{Jsondocument})
      console.log(response.document._meta.asyncapi.input,"<<<<<<<this is the response")
      // console.log(Object.keys(response.document._json.operations))
       operationList = Object.keys(response.document._json.operations);
      // console.log( JSON.stringify(response.document), {Jsondocument}, response.document._json.channels['/hello'].publish.operationId)
      //  operation_id = response.document._json.channels['/hello'].publish.operationId
      // console.log({operation_id})

    } catch (err: any) {
      switch (err.code) {
      case 'EEXIST':
        this.error(`Unable to create the project. We tried to use "${projectName}" as the directory of your new project but it already exists (${PROJECT_DIRECTORY}). Please specify a different name for the new project. For example, run the following command instead:\n\n  asyncapi new ${this.commandName} --name ${projectName}-1\n`);
        break;
      case 'EACCES':
        this.error(`Unable to create the project. We tried to access the "${PROJECT_DIRECTORY}" directory but it was not possible due to file access permissions. Please check the write permissions of your current working directory ("${process.cwd()}").`);
        break;
      case 'EPERM':
        this.error(`Unable to create the project. We tried to create the "${PROJECT_DIRECTORY}" directory but the operation requires elevated privileges. Please check the privileges for your current user.`);
        break;
      default:
        this.error(`Unable to create the project. Please check the following message for further info about the error:\n\n${err}`);
      }
    }
    
  
    const createOperationFunction = async () => {
      for (const fileName of operationList) {
        await fPromises.writeFile(`${PROJECT_DIRECTORY}/functions/${fileName}.js`, "");
        await fPromises.copyFile(
          `${PROJECT_DIRECTORY}/functions/onHello.js`,
          `${PROJECT_DIRECTORY}/functions/${fileName}.js`
        );
      }
    };
        try {
      await fs.copy(GLEE_TEMPLATES_DIRECTORY, PROJECT_DIRECTORY);
      await fPromises.rename(`${PROJECT_DIRECTORY}/env`, `${PROJECT_DIRECTORY}/.env`);
      await fPromises.rename(`${PROJECT_DIRECTORY}/gitignore`, `${PROJECT_DIRECTORY}/.gitignore`);
      await fPromises.rename(`${PROJECT_DIRECTORY}/README-template.md`, `${PROJECT_DIRECTORY}/README.md`);

        await createOperationFunction()
        await fPromises.unlink(`${PROJECT_DIRECTORY}/functions/onHello.js`);

      await fPromises.writeFile(`${PROJECT_DIRECTORY}/asyncapi.yaml`,asyncApiFile);


      this.log(`Your project "${projectName}" has been created successfully!\n\nNext steps:\n\n  cd ${projectName}\n  npm install\n  npm run dev\n\nAlso, you can already open the project in your favorite editor and start tweaking it.`);
    } catch (err) {
      this.error(`Unable to create the project. Please check the following message for further info about the error:\n\n${err}`);
    }
  }
  // const parseDocument = async () =>{

  // }
}